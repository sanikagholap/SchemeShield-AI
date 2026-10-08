import { useState, useCallback } from 'react';
import { VerificationResult, SchemeVerificationRequest } from '../types/verification';
import { verificationService } from '../services/verificationService';

export function useVerification() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (request: SchemeVerificationRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await verificationService.verifySchemeText(request);
      setResult(data);
      return data;
    } catch (err: any) {
      const msg = err?.message || 'Verification pipeline encountered an error.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    verify,
    reset
  };
}
