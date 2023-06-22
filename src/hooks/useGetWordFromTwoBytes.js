import { useCallback } from 'react';

const useGetWordFromTwoBytes = () => {
    const getWordFromTwoBytes = useCallback((byte1, byte2, bigEndian) => {
        const buffer = new ArrayBuffer(2);
        const view = new DataView(buffer);
        view.setUint8(0, byte1);
        view.setUint8(1, byte2);
        return bigEndian ? view.getInt16(0) : view.getInt16(0, true);
    }, []);

    return getWordFromTwoBytes;
}

export default useGetWordFromTwoBytes;
