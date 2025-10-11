"use client";
import React, { useState, useRef, useEffect } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/ToastProvider';
import { useVerifyResetCode, useResendVerification } from '@/hooks/useAuth';

interface VerifyResetCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailOrUsername: string;
  onSuccess: () => void;
}

export default function VerifyResetCodeModal({ isOpen, onClose, emailOrUsername, onSuccess }: VerifyResetCodeModalProps) {
  const [code, setCode] = useState<string[]>(new Array(6).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { showToast } = useToast();
  const [timer, setTimer] = React.useState(300); // 5 phút = 300 giây
  const [canResend, setCanResend] = React.useState(false);

  // Gửi lại code
  const resendVerificationMutation = useResendVerification({
    onSuccess: (data) => {
      showToast('Thành công', data.message, 'success');
      setTimer(300); // reset timer
      setCanResend(false);
    },
    onError: (error) => {
      showToast('Lỗi', error, 'error');
    }
  });

  // Đếm ngược timer
  React.useEffect(() => {
    if (!isOpen) return;
    if (canResend) return;
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isOpen, canResend]);

  // Reset timer khi mở modal
  React.useEffect(() => {
    if (isOpen) {
      setTimer(300);
      setCanResend(false);
    }
  }, [isOpen]);

  const verifyResetCodeMutation = useVerifyResetCode({
    onSuccess: (data) => {
      showToast('Thành công', data.message, 'success');
      onSuccess();
    },
    onError: (error) => {
      showToast('Lỗi', error, 'error');
      // Clear code on error
      setCode(new Array(6).fill(''));
      const firstInput = inputRefs.current[0];
      if (firstInput) firstInput.focus();
    }
  });

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value)) || element.value === ' ') {
      element.value = '';
      return;
    }

    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    if (element.value && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Auto submit when all 6 digits are filled
    if (newCode.every(digit => digit !== '') && element.value) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newCode = new Array(6).fill('');
    for (let i = 0; i < pasteData.length; i++) {
      newCode[i] = pasteData[i];
    }
    setCode(newCode);
    
    const lastFullInput = Math.min(pasteData.length - 1, 5);
    if (lastFullInput >= 0) {
      const targetInput = inputRefs.current[lastFullInput];
      if (targetInput) {
        targetInput.focus();
      }
    }

    // Auto submit if 6 digits pasted
    if (pasteData.length === 6) {
      handleSubmit(pasteData);
    }
  };

  const handleSubmit = (codeString: string) => {
    if (codeString.length === 6) {
      verifyResetCodeMutation.mutate({
        emailOrUsername,
        code: codeString
      });
    }
  };

  const handleManualSubmit = () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      showToast('Lỗi', 'Vui lòng nhập đủ 6 số', 'error');
      return;
    }
    handleSubmit(codeString);
  };

  useEffect(() => {
    if (isOpen) {
      const firstInput = inputRefs.current[0];
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác minh mã">
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nhập mã xác minh
          </h3>
          <p className="text-sm text-gray-600">
            Chúng tôi đã gửi mã 6 số đến email của bạn. Vui lòng nhập mã để tiếp tục.
          </p>
        </div>

        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {code.map((data, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="tel"
              maxLength={1}
              value={data}
              placeholder="•"
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => {
                e.target.select();
                setFocusedIndex(index);
              }}
              onBlur={() => setFocusedIndex(-1)}
              disabled={verifyResetCodeMutation.isPending}
              className={`w-12 h-14 text-center text-xl font-semibold bg-gray-50 text-gray-900 rounded-lg outline-none transition-all placeholder-gray-400 ${
                focusedIndex === index 
                  ? 'border-2 border-pink-500' 
                  : 'border border-gray-300 hover:border-gray-400'
              } ${verifyResetCodeMutation.isPending ? 'opacity-50' : ''}`}
            />
          ))}
        </div>

        <button
          onClick={handleManualSubmit}
          disabled={verifyResetCodeMutation.isPending || code.some(digit => digit === '')}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {verifyResetCodeMutation.isPending ? 'Đang xác minh...' : 'Xác minh'}
        </button>

        <button
          onClick={() => resendVerificationMutation.mutate({ email: emailOrUsername })}
          disabled={!canResend || resendVerificationMutation.isPending}
          className={`w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50`}
        >
          {resendVerificationMutation.isPending
            ? 'Đang gửi lại mã...'
            : canResend
              ? 'Gửi lại mã xác minh'
              : `Gửi lại mã sau ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2,'0')}`}
        </button>
        <p className="text-xs text-gray-500">
          Mã sẽ hết hạn sau 10 phút. Nếu không nhận được mã, vui lòng kiểm tra thư mục spam.
        </p>
      </div>
    </Modal>
  );
}