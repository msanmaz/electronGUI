import { useCallback } from 'react';

function useGetWordFromFourBytes() {
    const getWordFromFourBytes = useCallback((byte1, byte2, byte3, byte4, bigEndian) => {
        let buffer = new ArrayBuffer(4);
        let view = new DataView(buffer);

        view.setUint8(0, byte1);
        view.setUint8(1, byte2);
        view.setUint8(2, byte3);
        view.setUint8(3, byte4);

        return view.getInt32(0, !bigEndian);
    }, []);

    return getWordFromFourBytes;
}

export default useGetWordFromFourBytes;
