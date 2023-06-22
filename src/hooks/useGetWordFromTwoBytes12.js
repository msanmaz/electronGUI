import useGetWordFromTwoBytes from './useGetWordFromTwoBytes';
import { useCallback } from 'react';

function useGetWordFromTwoBytes12() {
  const getWordFromTwoBytes = useGetWordFromTwoBytes();
  
  return useCallback((byte1, byte2, bigEndian) => {
    const sixteenBitResult = getWordFromTwoBytes(byte1, byte2, bigEndian);
    if (sixteenBitResult === 0) {
      return 0;
    } else {
      return sixteenBitResult / 16;
    }
  }, [getWordFromTwoBytes]);
}

export default useGetWordFromTwoBytes12;
