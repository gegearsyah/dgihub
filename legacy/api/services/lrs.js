/**
 * Learning Record Store (LRS) Service
 * Handles xAPI (Experience API) statements for learning activity tracking
 * Flow Chart Node: [35, 47]
 */

const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class LRSService {
  /**
   * Store xAPI statement
   * @param {Object} statement - xAPI statement object
   * @returns {Promise<Object>} Stored statement
   */
  async storeStatement(statement) {
    try {
      const statementId = statement.id || `https://dgihub.go.id/xapi/statements/${uuidv4()}`;
      
      // Extract actor information
      const actor = statement.actor || {};
      const verb = statement.verb || {};
      const object = statement.object || {};
      const result = statement.result || {};
      const context = statement.context || {};

      // Store in database
      const result_query = await pool.query(
        `INSERT INTO lrs.statements (
          xapi_statement_id,
          actor_type, actor_account_name, actor_account_homepage,
          actor_mbox, actor_name, actor_json,
          verb_id, verb_display, verb_json,
          object_type, object_id, object_definition_name,
          object_definition_description, object_definition_type, object_json,
          result_score_scaled, result_score_raw, result_score_min, result_score_max,
          result_success, result_completion, result_duration, result_response,
          context_registration, context_instructor, context_team, context_context_activities,
          context_extensions, context_json,
          timestamp, stored, authority_json, statement_json
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35
        )
        RETURNING statement_id, xapi_statement_id, stored`,
        [
          statementId,
          actor.objectType || 'Agent',
          actor.account?.name || null,
          actor.account?.homePage || null,
          actor.mbox || null,
          actor.name || null,
          JSON.stringify(actor),
          verb.id || null,
          JSON.stringify(verb.display || {}),
          JSON.stringify(verb),
          object.objectType || 'Activity',
          object.id || null,
          JSON.stringify(object.definition?.name || {}),
          JSON.stringify(object.definition?.description || {}),
          object.definition?.type || null,
          JSON.stringify(object),
          result.score?.scaled || null,
          result.score?.raw || null,
          result.score?.min || null,
          result.score?.max || null,
          result.success || null,
          result.completion || null,
          result.duration || null,
          result.response || null,
          context.registration || null,
          context.instructor ? JSON.stringify(context.instructor) : null,
          context.team ? JSON.stringify(context.team) : null,
          context.contextActivities ? JSON.stringify(context.contextActivities) : null,
          context.extensions ? JSON.stringify(context.extensions) : null,
          JSON.stringify(context),
          statement.timestamp || new Date().toISOString(),
          new Date().toISOString(),
          statement.authority ? JSON.stringify(statement.authority) : null,
          JSON.stringify(statement)
        ]
      );

      return {
        success: true,
        statementId: result_query.rows[0].xapi_statement_id,
        stored: result_query.rows[0].stored
      };
    } catch (error) {
      console.error('LRS store statement error:', error);
      throw new Error('Failed to store xAPI statement');
    }
  }

  /**
   * Record course enrollment activity
   * @param {string} talentaId - Talenta profile ID
   * @param {string} kursusId - Course ID
   * @returns {Promise<Object>} Statement result
   */
  async recordEnrollment(talentaId, kursusId) {
    // Get user and course info
    const userResult = await pool.query(
      `SELECT u.email, u.full_name, tp.profile_id
       FROM users u
       JOIN talenta_profiles tp ON u.user_id = tp.user_id
       WHERE tp.profile_id = $1`,
      [talentaId]
    );

    const courseResult = await pool.query(
      `SELECT kursus_id, title, description FROM kursus WHERE kursus_id = $1`,
      [kursusId]
    );

    if (userResult.rows.length === 0 || courseResult.rows.length === 0) {
      throw new Error('User or course not found');
    }

    const user = userResult.rows[0];
    const course = courseResult.rows[0];

    const statement = {
      id: `https://dgihub.go.id/xapi/statements/${uuidv4()}`,
      actor: {
        objectType: 'Agent',
        mbox: `mailto:${user.email}`,
        name: user.full_name
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/registered',
        display: {
          'en-US': 'registered',
          'id-ID': 'mendaftar'
        }
      },
      object: {
        objectType: 'Activity',
        id: `https://dgihub.go.id/courses/${kursusId}`,
        definition: {
          type: 'http://adlnet.gov/expapi/activities/course',
          name: {
            'en-US': course.title,
            'id-ID': course.title
          },
          description: {
            'en-US': course.description || course.title,
            'id-ID': course.description || course.title
          }
        }
      },
      context: {
        registration: uuidv4(),
        extensions: {
          'https://dgihub.go.id/xapi/extensions/course-id': kursusId
        }
      },
      timestamp: new Date().toISOString()
    };

    return await this.storeStatement(statement);
  }

  /**
   * Record course completion activity
   * @param {string} talentaId - Talenta profile ID
   * @param {string} kursusId - Course ID
   * @param {number} score - Completion score
   * @returns {Promise<Object>} Statement result
   */
  async recordCompletion(talentaId, kursusId, score = null) {
    const userResult = await pool.query(
      `SELECT u.email, u.full_name FROM users u
       JOIN talenta_profiles tp ON u.user_id = tp.user_id
       WHERE tp.profile_id = $1`,
      [talentaId]
    );

    const courseResult = await pool.query(
      `SELECT kursus_id, title FROM kursus WHERE kursus_id = $1`,
      [kursusId]
    );

    if (userResult.rows.length === 0 || courseResult.rows.length === 0) {
      throw new Error('User or course not found');
    }

    const user = userResult.rows[0];
    const course = courseResult.rows[0];

    const statement = {
      id: `https://dgihub.go.id/xapi/statements/${uuidv4()}`,
      actor: {
        objectType: 'Agent',
        mbox: `mailto:${user.email}`,
        name: user.full_name
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/completed',
        display: {
          'en-US': 'completed',
          'id-ID': 'menyelesaikan'
        }
      },
      object: {
        objectType: 'Activity',
        id: `https://dgihub.go.id/courses/${kursusId}`,
        definition: {
          type: 'http://adlnet.gov/expapi/activities/course',
          name: {
            'en-US': course.title,
            'id-ID': course.title
          }
        }
      },
      result: score !== null ? {
        success: score >= 70,
        completion: true,
        score: {
          scaled: score / 100,
          raw: score,
          min: 0,
          max: 100
        }
      } : {
        success: true,
        completion: true
      },
      context: {
        extensions: {
          'https://dgihub.go.id/xapi/extensions/course-id': kursusId
        }
      },
      timestamp: new Date().toISOString()
    };

    return await this.storeStatement(statement);
  }

  /**
   * Record workshop attendance with GPS
   * @param {string} talentaId - Talenta profile ID
   * @param {string} workshopId - Workshop ID
   * @param {string} sessionId - Session ID
   * @param {number} latitude - GPS latitude
   * @param {number} longitude - GPS longitude
   * @returns {Promise<Object>} Statement result
   */
  async recordWorkshopAttendance(talentaId, workshopId, sessionId, latitude, longitude) {
    const userResult = await pool.query(
      `SELECT u.email, u.full_name FROM users u
       JOIN talenta_profiles tp ON u.user_id = tp.user_id
       WHERE tp.profile_id = $1`,
      [talentaId]
    );

    const workshopResult = await pool.query(
      `SELECT workshop_id, title FROM workshop WHERE workshop_id = $1`,
      [workshopId]
    );

    if (userResult.rows.length === 0 || workshopResult.rows.length === 0) {
      throw new Error('User or workshop not found');
    }

    const user = userResult.rows[0];
    const workshop = workshopResult.rows[0];

    const statement = {
      id: `https://dgihub.go.id/xapi/statements/${uuidv4()}`,
      actor: {
        objectType: 'Agent',
        mbox: `mailto:${user.email}`,
        name: user.full_name
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/attended',
        display: {
          'en-US': 'attended',
          'id-ID': 'hadir'
        }
      },
      object: {
        objectType: 'Activity',
        id: `https://dgihub.go.id/workshops/${workshopId}/sessions/${sessionId}`,
        definition: {
          type: 'http://adlnet.gov/expapi/activities/meeting',
          name: {
            'en-US': workshop.title,
            'id-ID': workshop.title
          }
        }
      },
      context: {
        extensions: {
          'https://dgihub.go.id/xapi/extensions/workshop-id': workshopId,
          'https://dgihub.go.id/xapi/extensions/session-id': sessionId,
          'https://dgihub.go.id/xapi/extensions/location': {
            latitude,
            longitude,
            type: 'GPS'
          }
        }
      },
      timestamp: new Date().toISOString()
    };

    return await this.storeStatement(statement);
  }

  /**
   * Get learning records for a user
   * @param {string} talentaId - Talenta profile ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Learning records
   */
  async getLearningRecords(talentaId, filters = {}) {
    const userResult = await pool.query(
      `SELECT u.email FROM users u
       JOIN talenta_profiles tp ON u.user_id = tp.user_id
       WHERE tp.profile_id = $1`,
      [talentaId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const email = userResult.rows[0].email;

    let queryText = `
      SELECT 
        statement_id,
        xapi_statement_id,
        verb_id,
        verb_display,
        object_id,
        object_definition_name,
        result_success,
        result_completion,
        result_score_scaled,
        timestamp,
        stored
      FROM lrs.statements
      WHERE actor_mbox = $1
    `;

    const queryParams = [`mailto:${email}`];
    let paramIndex = 2;

    if (filters.verbId) {
      queryText += ` AND verb_id = $${paramIndex}`;
      queryParams.push(filters.verbId);
      paramIndex++;
    }

    if (filters.startDate) {
      queryText += ` AND timestamp >= $${paramIndex}`;
      queryParams.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      queryText += ` AND timestamp <= $${paramIndex}`;
      queryParams.push(filters.endDate);
      paramIndex++;
    }

    queryText += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`;
    queryParams.push(filters.limit || 100);

    const result = await pool.query(queryText, queryParams);

    return result.rows;
  }
}

module.exports = new LRSService();





