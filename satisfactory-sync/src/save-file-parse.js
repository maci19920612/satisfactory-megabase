const fs = require("fs");
const fsPromises = fs.promises;

const ENCODING_LITTLE_ENDIAN = "little";
const ENCODING_BIG_ENDIAN = "big";

async function createReader(fileName, encoding) {
    if (!fs.existsSync(fileName)) {
        //|| !fs.accessSync(fileName, fs.R_OK)
        throw new Error(`File not exists or can't read: ${fileName}`);
    }
    encoding = encoding || ENCODING_LITTLE_ENDIAN;
    let fileHandle = await fsPromises.open(fileName);
    return {
        //_fileDescriptor: fs.openSync(fileName),
        _fileHandle: fileHandle,
        _integerBuffer: Buffer.alloc(4), //TODO: Check with a single buffer
        _longBuffer: Buffer.alloc(8),
        _byteBuffer: Buffer.alloc(1),
        _offsetCounter: 0,
        async readInt() {
            await this._fileHandle.read(this._integerBuffer, 0, 4, this._offsetCounter);
            this._offsetCounter += 4;
            return encoding == ENCODING_LITTLE_ENDIAN ? this._integerBuffer.readInt32LE() : this._integerBuffer.readInt32BE();
        },
        async readLong() {
            await this._fileHandle.read(this._longBuffer, 0, 8, this._offsetCounter);
            this._offsetCounter += 8;
            return encoding == ENCODING_LITTLE_ENDIAN ? this._longBuffer.readInt32LE() : this._longBuffer.readInt32BE();
        },
        async readString() {
            let length = await this.readInt();
            let stringBuffer = Buffer.alloc(length);
            await this._fileHandle.read(stringBuffer, 0, length, this._offsetCounter);
            this._offsetCounter += length;
            return stringBuffer.toString('utf-8').replace('\x00', '');
        },
        async readByte() {
            await this._fileHandle.read(this._byteBuffer, 0, 1, this._offsetCounter);
            this._offsetCounter++;
            return this._byteBuffer.readUInt8();
        },
        reset() {
            this._offsetCounter = 0;
        },
        async close() {
            let closedFunction = () => {
                throw new Error(`The reader is already closed!`);
            };

            this.readInt = closedFunction;
            this.readLong = closedFunction;
            this.readByte = closedFunction;
            this.readString = closedFunction;

            this.close = closedFunction;
            await this._fileHandle.close();
            this._integerBuffer = undefined;
        }
    };
};

module.exports = async function parseSaveFile(file) {
    try {
        let reader = await createReader(file, ENCODING_LITTLE_ENDIAN);
        let saveHeaderVersion = await reader.readInt();
        let saveVersion = await reader.readInt();
        let buildVersion = await reader.readInt();
        let worldType = await reader.readString();
        let worldProperties = await reader.readString();
        let sessionName = await reader.readString();
        let playTime = await reader.readInt();
        let saveDate = await reader.readLong();
        let sessionVisibility = await reader.readByte();
        let editorObjectVersion = await reader.readInt();
        let modMetadata = await reader.readString();
        let modFlags = await reader.readInt();
        await reader.close();

        return {
            file,
            saveHeaderVersion,
            saveVersion,
            buildVersion,
            worldType,
            worldProperties,
            sessionName,
            playTime,
            saveDate,
            sessionVisibility,
            editorObjectVersion,
            modMetadata,
            modFlags
        };
    } catch (ex) {
        return null;
    }
};
