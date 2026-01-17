# Workshop Duplicate & Additional Features

## ✅ New Features Added

### 1. **Duplicate/Copy Workshop** 📋
- **Copy Button**: Click the copy icon on any workshop card
- **Smart Duplication**:
  - Copies all workshop details (title, description, location, capacity, price, etc.)
  - Automatically adds "(Copy)" to the title
  - Sets start date to tomorrow (so you can easily adjust)
  - Resets status to DRAFT
  - Keeps all other settings (time, location, capacity, price)
- **Workflow**: Copy → Review → Adjust dates → Create
- **Perfect for**: Creating similar workshops with different dates/types

### 2. **Search Functionality** 🔍
- **Real-time Search**: Search across multiple fields
- **Search Fields**:
  - Workshop title
  - Description
  - City
  - Location name
- **Instant Results**: Updates as you type
- **Clear Indicator**: Shows "X of Y workshops" when filtered

### 3. **Status Filter** 🎯
- **Filter Options**:
  - All Status (default)
  - Draft
  - Published
  - Completed
  - Cancelled
- **Quick Access**: Dropdown filter in the search bar
- **Combines with Search**: Works together with search query

### 4. **Statistics Dashboard** 📊
- **Toggle Button**: "Statistics" button in header
- **8 Key Metrics**:
  1. **Total Workshops**: All workshops count
  2. **Published**: Currently published workshops
  3. **Draft**: Draft workshops
  4. **Completed**: Finished workshops
  5. **Cancelled**: Cancelled workshops
  6. **Total Registrations**: Sum of all registrations
  7. **Occupancy Rate**: Percentage of capacity filled
  8. **Total Revenue**: Calculated revenue (price × registrations)
- **Color-coded**: Different colors for different metrics
- **Real-time**: Updates automatically when data changes

### 5. **Export to CSV** 📥
- **Export Button**: "Export" button in header
- **Exports**:
  - Title
  - Status
  - Start Date
  - Location
  - City
  - Capacity
  - Registered Count
  - Price
  - Revenue (calculated)
- **File Name**: `workshops-export-YYYY-MM-DD.csv`
- **Success Notification**: Toast notification on export

## 🎯 Usage Examples

### Duplicate a Workshop:
1. Find the workshop you want to copy
2. Click the **Copy** icon (📋) on the workshop card
3. Form opens with all data pre-filled
4. Title automatically has "(Copy)" added
5. Start date is set to tomorrow
6. Review and adjust any fields (especially dates)
7. Click **Create Workshop**
8. New workshop created with copied settings!

### Search Workshops:
1. Type in the search box
2. Results filter instantly
3. Search works across title, description, city, location
4. Clear search to see all workshops again

### Filter by Status:
1. Click the filter dropdown
2. Select a status (Draft, Published, etc.)
3. Only workshops with that status are shown
4. Combine with search for precise filtering

### View Statistics:
1. Click **Statistics** button
2. Dashboard shows all key metrics
3. Click again to hide
4. Metrics update automatically

### Export Data:
1. Click **Export** button
2. CSV file downloads automatically
3. Open in Excel/Google Sheets
4. All workshop data included

## 📊 Statistics Explained

- **Total**: All workshops regardless of status
- **Published**: Currently active and accepting registrations
- **Draft**: Not yet published
- **Completed**: Finished workshops
- **Cancelled**: Cancelled workshops
- **Total Registrations**: Sum of all participant registrations
- **Occupancy Rate**: (Total Registrations / Total Capacity) × 100
- **Total Revenue**: Sum of (Price × Registrations) for all workshops

## 🎨 UI Improvements

- **Better Layout**: Search and filter in dedicated card
- **Clear Indicators**: Shows filtered count
- **Empty States**: Helpful messages when no results
- **Responsive**: Works on all screen sizes
- **Smooth Animations**: Statistics dashboard slides in/out

## 💡 Use Cases

### Duplicate Feature:
- ✅ Create monthly workshops with same settings
- ✅ Copy a successful workshop for a different date
- ✅ Reuse workshop templates
- ✅ Create workshops in different cities with same content
- ✅ Quick setup for recurring events

### Search & Filter:
- ✅ Find specific workshops quickly
- ✅ Filter by status for management
- ✅ ✅ Track workshop performance by status
- ✅ ✅ Organize workshops by location

### Statistics:
- ✅ Monitor overall performance
- ✅ Track revenue and occupancy
- ✅ Plan future workshops based on data
- ✅ Report to stakeholders

### Export:
- ✅ Generate reports
- ✅ Share data with team
- ✅ Analyze in Excel/Sheets
- ✅ Backup workshop data

## 🔄 Workflow Example

**Scenario**: Create a similar workshop next month

1. Find the current workshop
2. Click **Copy** icon
3. Form opens with all data
4. Change start date to next month
5. Adjust title (remove "(Copy)" if needed)
6. Review other settings
7. Click **Create Workshop**
8. Done! Much faster than creating from scratch

## 📝 Notes

- Duplicated workshops start as DRAFT (you must publish them)
- Search is case-insensitive
- Filter and search work together
- Statistics calculate in real-time
- Export includes all workshops (not just filtered ones)
- All features support dark mode

## 🚀 Future Enhancements (Optional)

1. **Workshop Templates**: Save workshop configurations as templates
2. **Bulk Duplicate**: Copy multiple workshops at once
3. **Advanced Filters**: Filter by date range, price range, capacity
4. **Statistics Charts**: Visual charts and graphs
5. **Export Formats**: PDF, Excel, JSON options
6. **Workshop Scheduling**: Auto-schedule recurring workshops
7. **Smart Suggestions**: Suggest dates based on past workshops
