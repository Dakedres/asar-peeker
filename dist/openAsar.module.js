const headerSizeIndex = 12,
      headerOffset = 16,
      uInt32Size = 4,
      textDecoder = new TextDecoder('utf-8');

// Essentially just ripped from the chromium-pickle-js source, thanks for
// doing my math homework.
const alignInt = (i, alignment) =>
  i + (alignment - (i % alignment)) % alignment;

/**
 * 
 * @param {ArrayBuffer} archive Asar archive to open
 * @returns {ArchiveData}
 */
const openAsar = archive => {
  if(archive.length > Number.MAX_SAFE_INTEGER)
      throw new Error('Asar archive too large.')

    const headerSize = new DataView(archive).getUint32(headerSizeIndex, true),
          // Pickle wants to align the headers so that the payload length is
          // always a multiple of 4. This means you'll get "padding" bytes
          // after the header if you don't round up the stored value.
          //
          // IMO why not just store the aligned int and have us trim the json,
          // but it's whatever.
          headerEnd = headerOffset + headerSize,
          filesOffset = alignInt(headerEnd, uInt32Size),
          rawHeader = archive.slice(headerOffset, headerEnd),
          buffer = archive.slice(filesOffset);

    /**
     * @typedef {Object} ArchiveData
     * @property {Object} header - The asar file's manifest, containing the pointers to each index's files in the buffer
     * @property {ArrayBuffer} buffer - The contents of the archive, concatenated together.
     */
    return {
      header: JSON.parse( textDecoder.decode(rawHeader) ),
      buffer
    }
};

export { openAsar as default };
