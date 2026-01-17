'use client';

import { useState } from 'react';
import { X, CreditCard, Wallet, Smartphone, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  amount: number;
  onPaymentSuccess: (paymentMethod: string, paymentData: any) => void;
}

type PaymentMethod = 'credit_card' | 'bank_transfer' | 'e_wallet' | null;

export default function PaymentModal({
  isOpen,
  onClose,
  courseTitle,
  amount,
  onPaymentSuccess
}: PaymentModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    bankAccount: '',
    phoneNumber: ''
  });

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const mockPaymentData = {
        cardNumber: selectedMethod === 'credit_card' ? paymentData.cardNumber : undefined,
        cardName: selectedMethod === 'credit_card' ? paymentData.cardName : undefined,
        expiryDate: selectedMethod === 'credit_card' ? paymentData.expiryDate : undefined,
        cvv: selectedMethod === 'credit_card' ? paymentData.cvv : undefined,
        bankAccount: selectedMethod === 'bank_transfer' ? paymentData.bankAccount : undefined,
        phoneNumber: selectedMethod === 'e_wallet' ? paymentData.phoneNumber : undefined
      };

      onPaymentSuccess(selectedMethod, mockPaymentData);
      setProcessing(false);
    }, 2000);
  };

  const handleClose = () => {
    if (!processing) {
      setSelectedMethod(null);
      setPaymentData({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        bankAccount: '',
        phoneNumber: ''
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl mx-4 ${isDark ? 'bg-[#1B263B]' : 'bg-white'} rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`sticky top-0 ${isDark ? 'bg-[#1B263B]' : 'bg-white'} border-b ${isDark ? 'border-[#415A77]' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}`}>
            Payment
          </h2>
          <button
            onClick={handleClose}
            disabled={processing}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#0D1B2A]' : 'hover:bg-gray-100'} transition-colors`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Course Info */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-[#0D1B2A] border border-[#415A77]' : 'bg-gray-50 border border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}`}>Course</p>
            <p className={`font-semibold ${isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}`}>{courseTitle}</p>
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-[#415A77]">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}`}>Total Amount</span>
                <span className={`text-2xl font-bold ${isDark ? 'text-[#0EB0F9]' : 'text-[#0EB0F9]'}`}>
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <Label className={`mb-3 block ${isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}`}>
              Select Payment Method
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedMethod('credit_card')}
                disabled={processing}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'credit_card'
                    ? `${isDark ? 'border-[#0EB0F9] bg-[#0EB0F9]/10' : 'border-[#0EB0F9] bg-[#0EB0F9]/5'}`
                    : `${isDark ? 'border-[#415A77] hover:border-[#0EB0F9]' : 'border-gray-200 hover:border-[#0EB0F9]'}`
                }`}
              >
                <CreditCard className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-[#0EB0F9]' : 'text-[#0EB0F9]'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}`}>
                  Credit Card
                </p>
              </button>

              <button
                onClick={() => setSelectedMethod('bank_transfer')}
                disabled={processing}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'bank_transfer'
                    ? `${isDark ? 'border-[#0EB0F9] bg-[#0EB0F9]/10' : 'border-[#0EB0F9] bg-[#0EB0F9]/5'}`
                    : `${isDark ? 'border-[#415A77] hover:border-[#0EB0F9]' : 'border-gray-200 hover:border-[#0EB0F9]'}`
                }`}
              >
                <Wallet className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-[#0EB0F9]' : 'text-[#0EB0F9]'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}`}>
                  Bank Transfer
                </p>
              </button>

              <button
                onClick={() => setSelectedMethod('e_wallet')}
                disabled={processing}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'e_wallet'
                    ? `${isDark ? 'border-[#0EB0F9] bg-[#0EB0F9]/10' : 'border-[#0EB0F9] bg-[#0EB0F9]/5'}`
                    : `${isDark ? 'border-[#415A77] hover:border-[#0EB0F9]' : 'border-gray-200 hover:border-[#0EB0F9]'}`
                }`}
              >
                <Smartphone className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-[#0EB0F9]' : 'text-[#0EB0F9]'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}`}>
                  E-Wallet
                </p>
              </button>
            </div>
          </div>

          {/* Payment Form */}
          {selectedMethod && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-[#0D1B2A] border border-[#415A77]' : 'bg-gray-50 border border-gray-200'}`}>
              {selectedMethod === 'credit_card' && (
                <div className="space-y-4">
                  <div>
                    <Label className={isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}>Card Number</Label>
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                      maxLength={19}
                      className={isDark ? 'bg-[#1B263B] border-[#415A77] text-[#E0E1DD]' : ''}
                    />
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}>Cardholder Name</Label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                      className={isDark ? 'bg-[#1B263B] border-[#415A77] text-[#E0E1DD]' : ''}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className={isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}>Expiry Date</Label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                        maxLength={5}
                        className={isDark ? 'bg-[#1B263B] border-[#415A77] text-[#E0E1DD]' : ''}
                      />
                    </div>
                    <div>
                      <Label className={isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}>CVV</Label>
                      <Input
                        type="text"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                        maxLength={3}
                        className={isDark ? 'bg-[#1B263B] border-[#415A77] text-[#E0E1DD]' : ''}
                      />
                    </div>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}`}>
                    💳 Mock Payment Gateway - Use any card number for testing
                  </p>
                </div>
              )}

              {selectedMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div>
                    <Label className={isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}>Bank Account Number</Label>
                    <Input
                      type="text"
                      placeholder="1234567890"
                      value={paymentData.bankAccount}
                      onChange={(e) => setPaymentData({ ...paymentData, bankAccount: e.target.value })}
                      className={isDark ? 'bg-[#1B263B] border-[#415A77] text-[#E0E1DD]' : ''}
                    />
                  </div>
                  <div className={`p-3 rounded ${isDark ? 'bg-[#1B263B]' : 'bg-white'} border ${isDark ? 'border-[#415A77]' : 'border-gray-200'}`}>
                    <p className={`text-sm font-medium mb-2 ${isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}`}>
                      Transfer to:
                    </p>
                    <p className={`text-sm ${isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}`}>
                      Bank: Bank Mandiri<br />
                      Account: 1234567890<br />
                      Name: DGIHub Platform
                    </p>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}`}>
                    🏦 Mock Payment Gateway - Transfer will be verified automatically
                  </p>
                </div>
              )}

              {selectedMethod === 'e_wallet' && (
                <div className="space-y-4">
                  <div>
                    <Label className={isDark ? 'text-[#E0E1DD]' : 'text-gray-900'}>Phone Number</Label>
                    <Input
                      type="text"
                      placeholder="081234567890"
                      value={paymentData.phoneNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, phoneNumber: e.target.value })}
                      className={isDark ? 'bg-[#1B263B] border-[#415A77] text-[#E0E1DD]' : ''}
                    />
                  </div>
                  <div className={`p-3 rounded ${isDark ? 'bg-[#1B263B]' : 'bg-white'} border ${isDark ? 'border-[#415A77]' : 'border-gray-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}`}>
                      Supported: OVO, GoPay, DANA, LinkAja
                    </p>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}`}>
                    📱 Mock Payment Gateway - Use any phone number for testing
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClose}
              disabled={processing}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!selectedMethod || processing}
              className={`flex-1 ${isDark ? 'bg-[#0EB0F9] hover:bg-[#3BC0FF]' : 'bg-[#0EB0F9] hover:bg-[#0A9DE6]'}`}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(amount)}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
