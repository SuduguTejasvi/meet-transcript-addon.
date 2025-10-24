var transcriptAddon;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@deepgram/captions/dist/module/converters/AssemblyAiConverter.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@deepgram/captions/dist/module/converters/AssemblyAiConverter.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssemblyAiConverter: () => (/* binding */ AssemblyAiConverter)
/* harmony export */ });
/* harmony import */ var _lib_helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/helpers */ "./node_modules/@deepgram/captions/dist/module/lib/helpers.js");

const wordMap = (word) => {
    return {
        word: word.text,
        start: word.start,
        end: word.end,
        confidence: word.confidence,
        punctuated_word: word.text,
        speaker: word.speaker,
    };
};
class AssemblyAiConverter {
    constructor(transcriptionData) {
        this.transcriptionData = transcriptionData;
    }
    getLines(lineLength = 8) {
        const results = this.transcriptionData;
        let content = [];
        if (results.utterances) {
            results.utterances.forEach((utterance) => {
                if (utterance.words.length > lineLength) {
                    content.push(...(0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.chunkArray)(utterance.words.map((w) => wordMap(w)), lineLength));
                }
                else {
                    content.push(utterance.words.map((w) => wordMap(w)));
                }
            });
        }
        else {
            content.push(...(0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.chunkArray)(results.words.map((w) => wordMap(w)), lineLength));
        }
        return content;
    }
    getHeaders() {
        const output = [];
        output.push("NOTE");
        output.push("Transcription provided by Assembly AI");
        this.transcriptionData.id ? output.push(`Id: ${this.transcriptionData.id}`) : null;
        this.transcriptionData.audio_duration
            ? output.push(`Duration: ${this.transcriptionData.audio_duration}`)
            : null;
        return output;
    }
}
//# sourceMappingURL=AssemblyAiConverter.js.map

/***/ }),

/***/ "./node_modules/@deepgram/captions/dist/module/converters/DeepgramConverter.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@deepgram/captions/dist/module/converters/DeepgramConverter.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DeepgramConverter: () => (/* binding */ DeepgramConverter)
/* harmony export */ });
/* harmony import */ var _lib_helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/helpers */ "./node_modules/@deepgram/captions/dist/module/lib/helpers.js");

class DeepgramConverter {
    constructor(transcriptionData) {
        this.transcriptionData = transcriptionData;
    }
    getLines(lineLength = 8) {
        const { results } = this.transcriptionData;
        let content = [];
        if (results.utterances) {
            results.utterances.forEach((utterance) => {
                if (utterance.words.length > lineLength) {
                    content.push(...(0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.chunkArray)(utterance.words, lineLength));
                }
                else {
                    content.push(utterance.words);
                }
            });
        }
        else {
            const words = results.channels[0].alternatives[0].words;
            const diarize = "speaker" in words[0]; // was diarization used
            let buffer = [];
            let currentSpeaker = 0;
            words.forEach((word) => {
                var _a;
                if (diarize && word.speaker !== currentSpeaker) {
                    content.push(buffer);
                    buffer = [];
                }
                if (buffer.length === lineLength) {
                    content.push(buffer);
                    buffer = [];
                }
                if (diarize) {
                    currentSpeaker = (_a = word.speaker) !== null && _a !== void 0 ? _a : 0;
                }
                buffer.push(word);
            });
            content.push(buffer);
        }
        return content;
    }
    getHeaders() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const output = [];
        output.push("NOTE");
        output.push("Transcription provided by Deepgram");
        ((_a = this.transcriptionData.metadata) === null || _a === void 0 ? void 0 : _a.request_id)
            ? output.push(`Request Id: ${(_b = this.transcriptionData.metadata) === null || _b === void 0 ? void 0 : _b.request_id}`)
            : null;
        ((_c = this.transcriptionData.metadata) === null || _c === void 0 ? void 0 : _c.created)
            ? output.push(`Created: ${(_d = this.transcriptionData.metadata) === null || _d === void 0 ? void 0 : _d.created}`)
            : null;
        ((_e = this.transcriptionData.metadata) === null || _e === void 0 ? void 0 : _e.duration)
            ? output.push(`Duration: ${(_f = this.transcriptionData.metadata) === null || _f === void 0 ? void 0 : _f.duration}`)
            : null;
        ((_g = this.transcriptionData.metadata) === null || _g === void 0 ? void 0 : _g.channels)
            ? output.push(`Channels: ${(_h = this.transcriptionData.metadata) === null || _h === void 0 ? void 0 : _h.channels}`)
            : null;
        return output;
    }
}
//# sourceMappingURL=DeepgramConverter.js.map

/***/ }),

/***/ "./node_modules/@deepgram/captions/dist/module/converters/IConverter.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@deepgram/captions/dist/module/converters/IConverter.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isConverter: () => (/* binding */ isConverter)
/* harmony export */ });
function isConverter(object) {
    return "transcriptionData" in object;
}
//# sourceMappingURL=IConverter.js.map

/***/ }),

/***/ "./node_modules/@deepgram/captions/dist/module/converters/index.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@deepgram/captions/dist/module/converters/index.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssemblyAiConverter: () => (/* reexport safe */ _AssemblyAiConverter__WEBPACK_IMPORTED_MODULE_1__.AssemblyAiConverter),
/* harmony export */   DeepgramConverter: () => (/* reexport safe */ _DeepgramConverter__WEBPACK_IMPORTED_MODULE_0__.DeepgramConverter),
/* harmony export */   isConverter: () => (/* reexport safe */ _IConverter__WEBPACK_IMPORTED_MODULE_2__.isConverter)
/* harmony export */ });
/* harmony import */ var _DeepgramConverter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DeepgramConverter */ "./node_modules/@deepgram/captions/dist/module/converters/DeepgramConverter.js");
/* harmony import */ var _AssemblyAiConverter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AssemblyAiConverter */ "./node_modules/@deepgram/captions/dist/module/converters/AssemblyAiConverter.js");
/* harmony import */ var _IConverter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./IConverter */ "./node_modules/@deepgram/captions/dist/module/converters/IConverter.js");



//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@deepgram/captions/dist/module/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@deepgram/captions/dist/module/index.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssemblyAiConverter: () => (/* reexport safe */ _converters__WEBPACK_IMPORTED_MODULE_3__.AssemblyAiConverter),
/* harmony export */   DeepgramConverter: () => (/* reexport safe */ _converters__WEBPACK_IMPORTED_MODULE_3__.DeepgramConverter),
/* harmony export */   chunkArray: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_2__.chunkArray),
/* harmony export */   isConverter: () => (/* reexport safe */ _converters__WEBPACK_IMPORTED_MODULE_3__.isConverter),
/* harmony export */   secondsToTimestamp: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_2__.secondsToTimestamp),
/* harmony export */   srt: () => (/* binding */ srt),
/* harmony export */   webvtt: () => (/* binding */ webvtt)
/* harmony export */ });
/* harmony import */ var _converters__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./converters */ "./node_modules/@deepgram/captions/dist/module/converters/DeepgramConverter.js");
/* harmony import */ var _converters__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./converters */ "./node_modules/@deepgram/captions/dist/module/converters/IConverter.js");
/* harmony import */ var _lib_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/helpers */ "./node_modules/@deepgram/captions/dist/module/lib/helpers.js");
/* harmony import */ var _converters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./converters */ "./node_modules/@deepgram/captions/dist/module/converters/index.js");


const parseInput = (transcription) => {
    if (!(0,_converters__WEBPACK_IMPORTED_MODULE_1__.isConverter)(transcription)) {
        return new _converters__WEBPACK_IMPORTED_MODULE_0__.DeepgramConverter(transcription);
    }
    return transcription;
};
const webvtt = (transcription, lineLength = 8) => {
    const output = [];
    let data = parseInput(transcription);
    // default top of file
    output.push("WEBVTT");
    output.push("");
    // get converter specific headers
    data.getHeaders ? output.push(data.getHeaders().join("\n")) : null;
    data.getHeaders ? output.push("") : null;
    // get the lines
    const lines = data.getLines(lineLength);
    // is speaker output required?
    const speakerLabels = "speaker" in lines[0][0];
    lines.forEach((words) => {
        const firstWord = words[0];
        const lastWord = words[words.length - 1];
        output.push(`${(0,_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.secondsToTimestamp)(firstWord.start)} --> ${(0,_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.secondsToTimestamp)(lastWord.end)}`);
        const line = words.map((word) => { var _a; return (_a = word.punctuated_word) !== null && _a !== void 0 ? _a : word.word; }).join(" ");
        const speakerLabel = speakerLabels ? `<v Speaker ${firstWord.speaker}>` : "";
        output.push(`${speakerLabel}${line}`);
        output.push("");
    });
    return output.join("\n");
};
const srt = (transcription, lineLength = 8) => {
    const output = [];
    const data = parseInput(transcription);
    // get the lines
    let lines = data.getLines(lineLength);
    // is speaker output required?
    const speakerLabels = "speaker" in lines[0][0];
    let entry = 1;
    let currentSpeaker;
    lines.forEach((words) => {
        output.push((entry++).toString());
        const firstWord = words[0];
        const lastWord = words[words.length - 1];
        output.push(`${(0,_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.secondsToTimestamp)(firstWord.start, "HH:mm:ss,SSS")} --> ${(0,_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.secondsToTimestamp)(lastWord.end, "HH:mm:ss,SSS")}`);
        const line = words.map((word) => { var _a; return (_a = word.punctuated_word) !== null && _a !== void 0 ? _a : word.word; }).join(" ");
        const speakerLabel = speakerLabels && currentSpeaker !== firstWord.speaker
            ? `[Speaker ${firstWord.speaker}]\n`
            : "";
        output.push(`${speakerLabel}${line}`);
        output.push("");
        currentSpeaker = firstWord.speaker;
    });
    return output.join("\n");
};

/**
 * Helpful exports.
 */



//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@deepgram/captions/dist/module/lib/helpers.js":
/*!********************************************************************!*\
  !*** ./node_modules/@deepgram/captions/dist/module/lib/helpers.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   chunkArray: () => (/* binding */ chunkArray),
/* harmony export */   secondsToTimestamp: () => (/* binding */ secondsToTimestamp)
/* harmony export */ });
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var dayjs_plugin_utc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! dayjs/plugin/utc */ "./node_modules/dayjs/plugin/utc.js");
/* harmony import */ var dayjs_plugin_utc__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(dayjs_plugin_utc__WEBPACK_IMPORTED_MODULE_1__);


dayjs__WEBPACK_IMPORTED_MODULE_0___default().extend((dayjs_plugin_utc__WEBPACK_IMPORTED_MODULE_1___default()));
function secondsToTimestamp(seconds, format = "HH:mm:ss.SSS") {
    return dayjs__WEBPACK_IMPORTED_MODULE_0___default()(seconds * 1000)
        .utc()
        .format(format);
}
function chunkArray(arr, length) {
    const res = [];
    for (let i = 0; i < arr.length; i += length) {
        const chunkarr = arr.slice(i, i + length);
        res.push(chunkarr);
    }
    return res;
}
//# sourceMappingURL=helpers.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/DeepgramClient.js":
/*!******************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/DeepgramClient.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DeepgramClient)
/* harmony export */ });
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractClient.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/AgentLiveClient.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/AuthRestClient.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/ListenClient.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/ManageRestClient.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/ModelsRestClient.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/ReadRestClient.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/SelfHostedRestClient.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/SpeakClient.js");


/**
 * The DeepgramClient class provides access to various Deepgram API clients, including ListenClient, ManageClient, SelfHostedRestClient, ReadClient, and SpeakClient.
 *
 * @see https://github.com/deepgram/deepgram-js-sdk
 */
class DeepgramClient extends _packages__WEBPACK_IMPORTED_MODULE_1__.AbstractClient {
    /**
     * Returns a new instance of the AuthRestClient, which provides access to the Deepgram API's temporary token endpoints.
     *
     * @returns {AuthRestClient} A new instance of the AuthRestClient.
     * @see https://developers.deepgram.com/reference/token-based-auth-api/grant-token
     */
    get auth() {
        return new _packages__WEBPACK_IMPORTED_MODULE_3__.AuthRestClient(this.options);
    }
    /**
     * Returns a new instance of the ListenClient, which provides access to the Deepgram API's listening functionality.
     *
     * @returns {ListenClient} A new instance of the ListenClient.
     */
    get listen() {
        return new _packages__WEBPACK_IMPORTED_MODULE_4__.ListenClient(this.options);
    }
    /**
     * Returns a new instance of the ManageClient, which provides access to the Deepgram API's management functionality.
     *
     * @returns {ManageClient} A new instance of the ManageClient.
     */
    get manage() {
        return new _packages__WEBPACK_IMPORTED_MODULE_5__.ManageClient(this.options);
    }
    /**
     * Returns a new instance of the ModelsRestClient, which provides access to the Deepgram API's model functionality.
     *
     * @returns {ModelsRestClient} A new instance of the ModelsRestClient.
     */
    get models() {
        return new _packages__WEBPACK_IMPORTED_MODULE_6__.ModelsRestClient(this.options);
    }
    /**
     * Returns a new instance of the SelfHostedRestClient, which provides access to the Deepgram API's self-hosted functionality.
     *
     * @returns {OnPremClient} A new instance of the SelfHostedRestClient named as OnPremClient.
     * @deprecated use selfhosted() instead
     */
    get onprem() {
        return this.selfhosted;
    }
    /**
     * Returns a new instance of the SelfHostedRestClient, which provides access to the Deepgram API's self-hosted functionality.
     *
     * @returns {SelfHostedRestClient} A new instance of the SelfHostedRestClient.
     */
    get selfhosted() {
        return new _packages__WEBPACK_IMPORTED_MODULE_8__.SelfHostedRestClient(this.options);
    }
    /**
     * Returns a new instance of the ReadClient, which provides access to the Deepgram API's reading functionality.
     *
     * @returns {ReadClient} A new instance of the ReadClient.
     */
    get read() {
        return new _packages__WEBPACK_IMPORTED_MODULE_7__.ReadClient(this.options);
    }
    /**
     * Returns a new instance of the SpeakClient, which provides access to the Deepgram API's speaking functionality.
     *
     * @returns {SpeakClient} A new instance of the SpeakClient.
     */
    get speak() {
        return new _packages__WEBPACK_IMPORTED_MODULE_9__.SpeakClient(this.options);
    }
    /**
     * Returns a new instance of the AgentLiveClient, which provides access to Deepgram's Voice Agent API.
     *
     * @returns {AgentLiveClient} A new instance of the AgentLiveClient.
     * @beta
     */
    agent(endpoint = "/:version/agent/converse") {
        return new _packages__WEBPACK_IMPORTED_MODULE_2__.AgentLiveClient(this.options, endpoint);
    }
    /**
     * @deprecated
     * @see https://dpgr.am/js-v3
     */
    get transcription() {
        throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError();
    }
    /**
     * @deprecated
     * @see https://dpgr.am/js-v3
     */
    get projects() {
        throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError();
    }
    /**
     * @deprecated
     * @see https://dpgr.am/js-v3
     */
    get keys() {
        throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError();
    }
    /**
     * @deprecated
     * @see https://dpgr.am/js-v3
     */
    get members() {
        throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError();
    }
    /**
     * @deprecated
     * @see https://dpgr.am/js-v3
     */
    get scopes() {
        throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError();
    }
    /**
     * @deprecated
     * @see https://dpgr.am/js-v3
     */
    get invitation() {
        throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError();
    }
    /**
     * @deprecated
     * @see https://dpgr.am/js-v3
     */
    get usage() {
        throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError();
    }
    /**
     * @deprecated
     * @see https://dpgr.am/js-v3
     */
    get billing() {
        throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError();
    }
}
//# sourceMappingURL=DeepgramClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/index.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.AbstractClient),
/* harmony export */   AbstractLiveClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.AbstractLiveClient),
/* harmony export */   AbstractRestClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.AbstractRestClient),
/* harmony export */   AbstractRestfulClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.AbstractRestfulClient),
/* harmony export */   AbstractWsClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.AbstractWsClient),
/* harmony export */   AgentEvents: () => (/* reexport safe */ _lib_enums__WEBPACK_IMPORTED_MODULE_3__.AgentEvents),
/* harmony export */   AgentLiveClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.AgentLiveClient),
/* harmony export */   AuthRestClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.AuthRestClient),
/* harmony export */   CONNECTION_STATE: () => (/* reexport safe */ _lib_constants__WEBPACK_IMPORTED_MODULE_4__.CONNECTION_STATE),
/* harmony export */   CallbackUrl: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.CallbackUrl),
/* harmony export */   DEFAULT_AGENT_OPTIONS: () => (/* reexport safe */ _lib_constants__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_AGENT_OPTIONS),
/* harmony export */   DEFAULT_AGENT_URL: () => (/* reexport safe */ _lib_constants__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_AGENT_URL),
/* harmony export */   DEFAULT_GLOBAL_OPTIONS: () => (/* reexport safe */ _lib_constants__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_GLOBAL_OPTIONS),
/* harmony export */   DEFAULT_HEADERS: () => (/* reexport safe */ _lib_constants__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_HEADERS),
/* harmony export */   DEFAULT_OPTIONS: () => (/* reexport safe */ _lib_constants__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_OPTIONS),
/* harmony export */   DEFAULT_URL: () => (/* reexport safe */ _lib_constants__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_URL),
/* harmony export */   Deepgram: () => (/* binding */ Deepgram),
/* harmony export */   DeepgramApiError: () => (/* reexport safe */ _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramApiError),
/* harmony export */   DeepgramClient: () => (/* reexport safe */ _DeepgramClient__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   DeepgramError: () => (/* reexport safe */ _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramError),
/* harmony export */   DeepgramUnknownError: () => (/* reexport safe */ _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramUnknownError),
/* harmony export */   DeepgramVersionError: () => (/* reexport safe */ _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError),
/* harmony export */   ListenClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.ListenClient),
/* harmony export */   ListenLiveClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.ListenLiveClient),
/* harmony export */   ListenRestClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.ListenRestClient),
/* harmony export */   LiveClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.LiveClient),
/* harmony export */   LiveConnectionState: () => (/* reexport safe */ _lib_enums__WEBPACK_IMPORTED_MODULE_3__.LiveConnectionState),
/* harmony export */   LiveTTSEvents: () => (/* reexport safe */ _lib_enums__WEBPACK_IMPORTED_MODULE_3__.LiveTTSEvents),
/* harmony export */   LiveTranscriptionEvents: () => (/* reexport safe */ _lib_enums__WEBPACK_IMPORTED_MODULE_3__.LiveTranscriptionEvents),
/* harmony export */   ManageClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.ManageClient),
/* harmony export */   ManageRestClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.ManageRestClient),
/* harmony export */   ModelsRestClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.ModelsRestClient),
/* harmony export */   OnPremClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.OnPremClient),
/* harmony export */   PrerecordedClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.PrerecordedClient),
/* harmony export */   ReadClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.ReadClient),
/* harmony export */   ReadRestClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.ReadRestClient),
/* harmony export */   SOCKET_STATES: () => (/* reexport safe */ _lib_constants__WEBPACK_IMPORTED_MODULE_4__.SOCKET_STATES),
/* harmony export */   SelfHostedRestClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.SelfHostedRestClient),
/* harmony export */   SpeakClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.SpeakClient),
/* harmony export */   SpeakLiveClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.SpeakLiveClient),
/* harmony export */   SpeakRestClient: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.SpeakRestClient),
/* harmony export */   appendSearchParams: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.appendSearchParams),
/* harmony export */   applyDefaults: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.applyDefaults),
/* harmony export */   buildRequestUrl: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.buildRequestUrl),
/* harmony export */   convertLegacyOptions: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.convertLegacyOptions),
/* harmony export */   convertProtocolToWs: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.convertProtocolToWs),
/* harmony export */   createClient: () => (/* binding */ createClient),
/* harmony export */   isDeepgramClientOptions: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.isDeepgramClientOptions),
/* harmony export */   isDeepgramError: () => (/* reexport safe */ _lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError),
/* harmony export */   isFileSource: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.isFileSource),
/* harmony export */   isLiveSchema: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.isLiveSchema),
/* harmony export */   isTextSource: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.isTextSource),
/* harmony export */   isUrlSource: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.isUrlSource),
/* harmony export */   noop: () => (/* reexport safe */ _packages__WEBPACK_IMPORTED_MODULE_2__.noop),
/* harmony export */   resolveHeadersConstructor: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.resolveHeadersConstructor),
/* harmony export */   srt: () => (/* reexport safe */ _deepgram_captions__WEBPACK_IMPORTED_MODULE_6__.srt),
/* harmony export */   stripTrailingSlash: () => (/* reexport safe */ _lib_helpers__WEBPACK_IMPORTED_MODULE_5__.stripTrailingSlash),
/* harmony export */   webvtt: () => (/* reexport safe */ _deepgram_captions__WEBPACK_IMPORTED_MODULE_6__.webvtt)
/* harmony export */ });
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _DeepgramClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DeepgramClient */ "./node_modules/@deepgram/sdk/dist/module/DeepgramClient.js");
/* harmony import */ var _packages__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./packages */ "./node_modules/@deepgram/sdk/dist/module/packages/index.js");
/* harmony import */ var _lib_enums__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./lib/enums */ "./node_modules/@deepgram/sdk/dist/module/lib/enums/index.js");
/* harmony import */ var _lib_constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lib/constants */ "./node_modules/@deepgram/sdk/dist/module/lib/constants.js");
/* harmony import */ var _lib_helpers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./lib/helpers */ "./node_modules/@deepgram/sdk/dist/module/lib/helpers.js");
/* harmony import */ var _deepgram_captions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @deepgram/captions */ "./node_modules/@deepgram/captions/dist/module/index.js");


/**
 * This class is deprecated and should not be used. It throws a `DeepgramVersionError` when instantiated.
 *
 * @deprecated
 * @see https://dpgr.am/js-v3
 */
class Deepgram {
    constructor(apiKey, apiUrl, requireSSL) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.requireSSL = requireSSL;
        throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramVersionError();
    }
}
function createClient(keyOrOptions, options) {
    let resolvedOptions = {};
    if (typeof keyOrOptions === "string" || typeof keyOrOptions === "function") {
        if (typeof options === "object") {
            resolvedOptions = options;
        }
        resolvedOptions.key = keyOrOptions;
    }
    else if (typeof keyOrOptions === "object") {
        resolvedOptions = keyOrOptions;
    }
    return new _DeepgramClient__WEBPACK_IMPORTED_MODULE_1__["default"](resolvedOptions);
}

/**
 * Helpful exports.
 */






/**
 * Captions. These will be tree-shaken if unused.
 *
 * @see https://github.com/deepgram/deepgram-node-captions
 *
 * import/export declarations don't do anything but set up an alias to the
 * exported variable, they do not count as a "use". Given their semantics,
 * they are tracked specially by any bundler and will not adversely affect
 * tree-shaking.
 */

//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/constants.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/constants.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONNECTION_STATE: () => (/* binding */ CONNECTION_STATE),
/* harmony export */   DEFAULT_AGENT_OPTIONS: () => (/* binding */ DEFAULT_AGENT_OPTIONS),
/* harmony export */   DEFAULT_AGENT_URL: () => (/* binding */ DEFAULT_AGENT_URL),
/* harmony export */   DEFAULT_GLOBAL_OPTIONS: () => (/* binding */ DEFAULT_GLOBAL_OPTIONS),
/* harmony export */   DEFAULT_HEADERS: () => (/* binding */ DEFAULT_HEADERS),
/* harmony export */   DEFAULT_OPTIONS: () => (/* binding */ DEFAULT_OPTIONS),
/* harmony export */   DEFAULT_URL: () => (/* binding */ DEFAULT_URL),
/* harmony export */   SOCKET_STATES: () => (/* binding */ SOCKET_STATES)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@deepgram/sdk/dist/module/lib/helpers.js");
/* harmony import */ var _runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./runtime */ "./node_modules/@deepgram/sdk/dist/module/lib/runtime.js");
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./version */ "./node_modules/@deepgram/sdk/dist/module/lib/version.js");



const getAgent = () => {
    if ((0,_runtime__WEBPACK_IMPORTED_MODULE_1__.isNode)()) {
        return `node/${_runtime__WEBPACK_IMPORTED_MODULE_1__.NODE_VERSION}`;
    }
    else if ((0,_runtime__WEBPACK_IMPORTED_MODULE_1__.isBun)()) {
        return `bun/${_runtime__WEBPACK_IMPORTED_MODULE_1__.BUN_VERSION}`;
    }
    else if ((0,_runtime__WEBPACK_IMPORTED_MODULE_1__.isBrowser)()) {
        return `javascript ${_runtime__WEBPACK_IMPORTED_MODULE_1__.BROWSER_AGENT}`;
    }
    else {
        return `unknown`;
    }
};
const DEFAULT_HEADERS = {
    "Content-Type": `application/json`,
    "X-Client-Info": `@deepgram/sdk; ${(0,_runtime__WEBPACK_IMPORTED_MODULE_1__.isBrowser)() ? "browser" : "server"}; v${_version__WEBPACK_IMPORTED_MODULE_2__.version}`,
    "User-Agent": `@deepgram/sdk/${_version__WEBPACK_IMPORTED_MODULE_2__.version} ${getAgent()}`,
};
const DEFAULT_URL = "https://api.deepgram.com";
const DEFAULT_AGENT_URL = "wss://agent.deepgram.com";
const DEFAULT_GLOBAL_OPTIONS = {
    fetch: { options: { url: DEFAULT_URL, headers: DEFAULT_HEADERS } },
    websocket: {
        options: { url: (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.convertProtocolToWs)(DEFAULT_URL), _nodeOnlyHeaders: DEFAULT_HEADERS },
    },
};
const DEFAULT_AGENT_OPTIONS = {
    fetch: { options: { url: DEFAULT_URL, headers: DEFAULT_HEADERS } },
    websocket: {
        options: { url: DEFAULT_AGENT_URL, _nodeOnlyHeaders: DEFAULT_HEADERS },
    },
};
const DEFAULT_OPTIONS = {
    global: DEFAULT_GLOBAL_OPTIONS,
    agent: DEFAULT_AGENT_OPTIONS,
};
var SOCKET_STATES;
(function (SOCKET_STATES) {
    SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
    SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
    SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
    SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
})(SOCKET_STATES || (SOCKET_STATES = {}));
var CONNECTION_STATE;
(function (CONNECTION_STATE) {
    CONNECTION_STATE["Connecting"] = "connecting";
    CONNECTION_STATE["Open"] = "open";
    CONNECTION_STATE["Closing"] = "closing";
    CONNECTION_STATE["Closed"] = "closed";
})(CONNECTION_STATE || (CONNECTION_STATE = {}));
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/enums/AgentEvents.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/enums/AgentEvents.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgentEvents: () => (/* binding */ AgentEvents)
/* harmony export */ });
var AgentEvents;
(function (AgentEvents) {
    /**
     * Built in socket events.
     */
    AgentEvents["Open"] = "Open";
    AgentEvents["Close"] = "Close";
    AgentEvents["Error"] = "Error";
    /**
     * Audio event?
     */
    AgentEvents["Audio"] = "Audio";
    /**
     * Confirms the successful connection to the websocket.
     * { type: "Welcome", request_id: "String"}
     */
    AgentEvents["Welcome"] = "Welcome";
    /**
     * Confirms that your `configure` request was successful.
     * { type: "SettingsApplied" }
     */
    AgentEvents["SettingsApplied"] = "SettingsApplied";
    /**
     * Triggered when the agent "hears" the user say something.
     * { type: "ConversationText", role: string, content: string }
     */
    AgentEvents["ConversationText"] = "ConversationText";
    /**
     * Triggered when the agent begins receiving user audio.
     * { type: "UserStartedSpeaking" }
     */
    AgentEvents["UserStartedSpeaking"] = "UserStartedSpeaking";
    /**
     * Triggered when the user has stopped speaking and the agent is processing the audio.
     * { type: "AgentThinking", content: string }
     */
    AgentEvents["AgentThinking"] = "AgentThinking";
    /**
     * A request to call client-side functions.
     * { type: "FunctionCallRequest", functions: { id: string; name: string; arguments: string; client_side: boolean}[] }
     */
    AgentEvents["FunctionCallRequest"] = "FunctionCallRequest";
    /**
     * Triggered when the agent begins streaming an audio response.
     * YOU WILL ONLY RECEIVE THIS EVENT IF YOU HAVE ENABLED `experimental` IN YOUR CONFIG.
     * { type: "AgentStartedSpeaking", total_latency: number, tts_latency: number, ttt_latency: number }
     */
    AgentEvents["AgentStartedSpeaking"] = "AgentStartedSpeaking";
    /**
     * Triggered when the agent has finished streaming an audio response.
     * { type: "AgentAudioDone" }
     */
    AgentEvents["AgentAudioDone"] = "AgentAudioDone";
    /**
     * This event is only emitted when you send an `InjectAgentMessage` request while
     * the user is currently speaking or the server is processing user audio.
     * { type: "InjectionRefused", message: string }
     */
    AgentEvents["InjectionRefused"] = "InjectionRefused";
    /**
     * A successful response to the `UpdateInstructions` request.
     * { type: "PromptUpdated" }
     */
    AgentEvents["PromptUpdated"] = "PromptUpdated";
    /**
     * A successful response to the `UpdateSpeak` request.
     * { type: "SpeakUpdated" }
     */
    AgentEvents["SpeakUpdated"] = "SpeakUpdated";
    /**
     * Catch all for any other message event
     */
    AgentEvents["Unhandled"] = "Unhandled";
})(AgentEvents || (AgentEvents = {}));
//# sourceMappingURL=AgentEvents.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveConnectionState.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveConnectionState.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LiveConnectionState: () => (/* binding */ LiveConnectionState)
/* harmony export */ });
/**
 * Enum representing the different states of a live connection.
 *
 * @deprecated Since 3.4. Use `SOCKET_STATES` for generic socket connection states instead.
 */
var LiveConnectionState;
(function (LiveConnectionState) {
    LiveConnectionState[LiveConnectionState["CONNECTING"] = 0] = "CONNECTING";
    LiveConnectionState[LiveConnectionState["OPEN"] = 1] = "OPEN";
    LiveConnectionState[LiveConnectionState["CLOSING"] = 2] = "CLOSING";
    LiveConnectionState[LiveConnectionState["CLOSED"] = 3] = "CLOSED";
})(LiveConnectionState || (LiveConnectionState = {}));
//# sourceMappingURL=LiveConnectionState.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveTTSEvents.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveTTSEvents.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LiveTTSEvents: () => (/* binding */ LiveTTSEvents)
/* harmony export */ });
/**
 * Enumeration of events related to live text-to-speech synthesis.
 *
 * - `Open`: Built-in socket event for when the connection is opened.
 * - `Close`: Built-in socket event for when the connection is closed.
 * - `Error`: Built-in socket event for when an error occurs.
 * - `Metadata`: Event for when metadata is received.
 * - `Flushed`: Event for when the server has flushed the buffer.
 * - `Warning`: Event for when a warning is received.
 * - `Unhandled`: Catch-all event for any other message event.
 */
var LiveTTSEvents;
(function (LiveTTSEvents) {
    /**
     * Built in socket events.
     */
    LiveTTSEvents["Open"] = "Open";
    LiveTTSEvents["Close"] = "Close";
    LiveTTSEvents["Error"] = "Error";
    /**
     * Message { type: string }
     */
    LiveTTSEvents["Metadata"] = "Metadata";
    LiveTTSEvents["Flushed"] = "Flushed";
    LiveTTSEvents["Warning"] = "Warning";
    /**
     * Audio data event.
     */
    LiveTTSEvents["Audio"] = "Audio";
    /**
     * Catch all for any other message event
     */
    LiveTTSEvents["Unhandled"] = "Unhandled";
})(LiveTTSEvents || (LiveTTSEvents = {}));
//# sourceMappingURL=LiveTTSEvents.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveTranscriptionEvents.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveTranscriptionEvents.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LiveTranscriptionEvents: () => (/* binding */ LiveTranscriptionEvents)
/* harmony export */ });
/**
 * Enumeration of events related to live transcription.
 *
 * - `Open`: Built-in socket event for when the connection is opened.
 * - `Close`: Built-in socket event for when the connection is closed.
 * - `Error`: Built-in socket event for when an error occurs.
 * - `Transcript`: Event for when a transcript message is received.
 * - `Metadata`: Event for when metadata is received.
 * - `UtteranceEnd`: Event for when an utterance ends.
 * - `SpeechStarted`: Event for when speech is detected.
 * - `Unhandled`: Catch-all event for any other message event.
 */
var LiveTranscriptionEvents;
(function (LiveTranscriptionEvents) {
    /**
     * Built in socket events.
     */
    LiveTranscriptionEvents["Open"] = "open";
    LiveTranscriptionEvents["Close"] = "close";
    LiveTranscriptionEvents["Error"] = "error";
    /**
     * Message { type: string }
     */
    LiveTranscriptionEvents["Transcript"] = "Results";
    LiveTranscriptionEvents["Metadata"] = "Metadata";
    LiveTranscriptionEvents["UtteranceEnd"] = "UtteranceEnd";
    LiveTranscriptionEvents["SpeechStarted"] = "SpeechStarted";
    /**
     * Catch all for any other message event
     */
    LiveTranscriptionEvents["Unhandled"] = "Unhandled";
})(LiveTranscriptionEvents || (LiveTranscriptionEvents = {}));
//# sourceMappingURL=LiveTranscriptionEvents.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/enums/index.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/enums/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgentEvents: () => (/* reexport safe */ _AgentEvents__WEBPACK_IMPORTED_MODULE_0__.AgentEvents),
/* harmony export */   LiveConnectionState: () => (/* reexport safe */ _LiveConnectionState__WEBPACK_IMPORTED_MODULE_1__.LiveConnectionState),
/* harmony export */   LiveTTSEvents: () => (/* reexport safe */ _LiveTTSEvents__WEBPACK_IMPORTED_MODULE_3__.LiveTTSEvents),
/* harmony export */   LiveTranscriptionEvents: () => (/* reexport safe */ _LiveTranscriptionEvents__WEBPACK_IMPORTED_MODULE_2__.LiveTranscriptionEvents)
/* harmony export */ });
/* harmony import */ var _AgentEvents__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AgentEvents */ "./node_modules/@deepgram/sdk/dist/module/lib/enums/AgentEvents.js");
/* harmony import */ var _LiveConnectionState__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LiveConnectionState */ "./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveConnectionState.js");
/* harmony import */ var _LiveTranscriptionEvents__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./LiveTranscriptionEvents */ "./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveTranscriptionEvents.js");
/* harmony import */ var _LiveTTSEvents__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./LiveTTSEvents */ "./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveTTSEvents.js");




//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js":
/*!**************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/errors.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DeepgramApiError: () => (/* binding */ DeepgramApiError),
/* harmony export */   DeepgramError: () => (/* binding */ DeepgramError),
/* harmony export */   DeepgramUnknownError: () => (/* binding */ DeepgramUnknownError),
/* harmony export */   DeepgramVersionError: () => (/* binding */ DeepgramVersionError),
/* harmony export */   isDeepgramError: () => (/* binding */ isDeepgramError)
/* harmony export */ });
class DeepgramError extends Error {
    constructor(message) {
        super(message);
        this.__dgError = true;
        this.name = "DeepgramError";
    }
}
function isDeepgramError(error) {
    return typeof error === "object" && error !== null && "__dgError" in error;
}
class DeepgramApiError extends DeepgramError {
    constructor(message, status) {
        super(message);
        this.name = "DeepgramApiError";
        this.status = status;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
        };
    }
}
class DeepgramUnknownError extends DeepgramError {
    constructor(message, originalError) {
        super(message);
        this.name = "DeepgramUnknownError";
        this.originalError = originalError;
    }
}
class DeepgramVersionError extends DeepgramError {
    constructor() {
        super(`You are attempting to use an old format for a newer SDK version. Read more here: https://dpgr.am/js-v3`);
        this.name = "DeepgramVersionError";
    }
}
//# sourceMappingURL=errors.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/fetch.js":
/*!*************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/fetch.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchWithAuth: () => (/* binding */ fetchWithAuth),
/* harmony export */   resolveFetch: () => (/* binding */ resolveFetch),
/* harmony export */   resolveResponse: () => (/* binding */ resolveResponse)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@deepgram/sdk/dist/module/lib/helpers.js");
/* harmony import */ var cross_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! cross-fetch */ "./node_modules/cross-fetch/dist/browser-ponyfill.js");
/* harmony import */ var cross_fetch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(cross_fetch__WEBPACK_IMPORTED_MODULE_1__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


/**
 * Resolves the appropriate fetch function to use, either a custom fetch function provided as an argument, or the global fetch function if available, or the cross-fetch library if the global fetch function is not available.
 *
 * @param customFetch - An optional custom fetch function to use instead of the global fetch function.
 * @returns A fetch function that can be used to make HTTP requests.
 */
const resolveFetch = (customFetch) => {
    let _fetch;
    if (customFetch) {
        _fetch = customFetch;
    }
    else if (typeof fetch === "undefined") {
        _fetch = (cross_fetch__WEBPACK_IMPORTED_MODULE_1___default());
    }
    else {
        _fetch = fetch;
    }
    return (...args) => _fetch(...args);
};
/**
 * Resolves a fetch function that includes an "Authorization" header with the provided API key.
 *
 * @param apiKey - The API key to include in the "Authorization" header.
 * @param customFetch - An optional custom fetch function to use instead of the global fetch function.
 * @returns A fetch function that can be used to make HTTP requests with the provided API key in the "Authorization" header.
 */
const fetchWithAuth = (apiKey, customFetch) => {
    const fetch = resolveFetch(customFetch);
    const HeadersConstructor = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.resolveHeadersConstructor)();
    return (input, init) => __awaiter(void 0, void 0, void 0, function* () {
        const headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
        if (!headers.has("Authorization")) {
            headers.set("Authorization", `Token ${apiKey}`);
        }
        return fetch(input, Object.assign(Object.assign({}, init), { headers }));
    });
};
/**
 * Resolves the appropriate Response object to use, either the global Response object if available, or the Response object from the cross-fetch library if the global Response object is not available.
 *
 * @returns The appropriate Response object to use for making HTTP requests.
 */
const resolveResponse = () => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof Response === "undefined") {
        return (yield Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! cross-fetch */ "./node_modules/cross-fetch/dist/browser-ponyfill.js", 23))).Response;
    }
    return Response;
});
//# sourceMappingURL=fetch.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/helpers.js":
/*!***************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/helpers.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CallbackUrl: () => (/* binding */ CallbackUrl),
/* harmony export */   appendSearchParams: () => (/* binding */ appendSearchParams),
/* harmony export */   applyDefaults: () => (/* binding */ applyDefaults),
/* harmony export */   buildRequestUrl: () => (/* binding */ buildRequestUrl),
/* harmony export */   convertLegacyOptions: () => (/* binding */ convertLegacyOptions),
/* harmony export */   convertProtocolToWs: () => (/* binding */ convertProtocolToWs),
/* harmony export */   isDeepgramClientOptions: () => (/* binding */ isDeepgramClientOptions),
/* harmony export */   isFileSource: () => (/* binding */ isFileSource),
/* harmony export */   isLiveSchema: () => (/* binding */ isLiveSchema),
/* harmony export */   isTextSource: () => (/* binding */ isTextSource),
/* harmony export */   isUrlSource: () => (/* binding */ isUrlSource),
/* harmony export */   resolveHeadersConstructor: () => (/* binding */ resolveHeadersConstructor),
/* harmony export */   stripTrailingSlash: () => (/* binding */ stripTrailingSlash)
/* harmony export */ });
/* harmony import */ var cross_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cross-fetch */ "./node_modules/cross-fetch/dist/browser-ponyfill.js");
/* harmony import */ var cross_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cross_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var deepmerge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! deepmerge */ "./node_modules/deepmerge/dist/cjs.js");
/* harmony import */ var deepmerge__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(deepmerge__WEBPACK_IMPORTED_MODULE_1__);


function stripTrailingSlash(url) {
    return url.replace(/\/$/, "");
}
function applyDefaults(options = {}, subordinate = {}) {
    return deepmerge__WEBPACK_IMPORTED_MODULE_1___default()(subordinate, options);
}
function appendSearchParams(searchParams, options) {
    Object.keys(options).forEach((i) => {
        if (Array.isArray(options[i])) {
            const arrayParams = options[i];
            arrayParams.forEach((param) => {
                searchParams.append(i, String(param));
            });
        }
        else {
            searchParams.append(i, String(options[i]));
        }
    });
}
const resolveHeadersConstructor = () => {
    if (typeof Headers === "undefined") {
        return cross_fetch__WEBPACK_IMPORTED_MODULE_0__.Headers;
    }
    return Headers;
};
const isUrlSource = (providedSource) => {
    if (providedSource.url)
        return true;
    return false;
};
const isTextSource = (providedSource) => {
    if (providedSource.text)
        return true;
    return false;
};
const isFileSource = (providedSource) => {
    if (isReadStreamSource(providedSource) || isBufferSource(providedSource))
        return true;
    return false;
};
const isBufferSource = (providedSource) => {
    if (providedSource)
        return true;
    return false;
};
const isReadStreamSource = (providedSource) => {
    if (providedSource)
        return true;
    return false;
};
class CallbackUrl extends URL {
    constructor() {
        super(...arguments);
        this.callbackUrl = true;
    }
}
const convertProtocolToWs = (url) => {
    const convert = (string) => string.toLowerCase().replace(/^http/, "ws");
    return convert(url);
};
const buildRequestUrl = (endpoint, baseUrl, transcriptionOptions) => {
    const url = new URL(endpoint, baseUrl);
    appendSearchParams(url.searchParams, transcriptionOptions);
    return url;
};
function isLiveSchema(arg) {
    return arg && typeof arg.interim_results !== "undefined";
}
function isDeepgramClientOptions(arg) {
    return arg && typeof arg.global !== "undefined";
}
const convertLegacyOptions = (optionsArg) => {
    var _a, _b, _c, _d, _e, _f;
    const newOptions = {};
    if (optionsArg._experimentalCustomFetch) {
        newOptions.global = {
            fetch: {
                client: optionsArg._experimentalCustomFetch,
            },
        };
    }
    optionsArg = deepmerge__WEBPACK_IMPORTED_MODULE_1___default()(optionsArg, newOptions);
    if ((_a = optionsArg.restProxy) === null || _a === void 0 ? void 0 : _a.url) {
        newOptions.global = {
            fetch: {
                options: {
                    proxy: {
                        url: (_b = optionsArg.restProxy) === null || _b === void 0 ? void 0 : _b.url,
                    },
                },
            },
        };
    }
    optionsArg = deepmerge__WEBPACK_IMPORTED_MODULE_1___default()(optionsArg, newOptions);
    if ((_c = optionsArg.global) === null || _c === void 0 ? void 0 : _c.url) {
        newOptions.global = {
            fetch: {
                options: {
                    url: optionsArg.global.url,
                },
            },
            websocket: {
                options: {
                    url: optionsArg.global.url,
                },
            },
        };
    }
    optionsArg = deepmerge__WEBPACK_IMPORTED_MODULE_1___default()(optionsArg, newOptions);
    if ((_d = optionsArg.global) === null || _d === void 0 ? void 0 : _d.headers) {
        newOptions.global = {
            fetch: {
                options: {
                    headers: (_e = optionsArg.global) === null || _e === void 0 ? void 0 : _e.headers,
                },
            },
            websocket: {
                options: {
                    _nodeOnlyHeaders: (_f = optionsArg.global) === null || _f === void 0 ? void 0 : _f.headers,
                },
            },
        };
    }
    optionsArg = deepmerge__WEBPACK_IMPORTED_MODULE_1___default()(optionsArg, newOptions);
    return optionsArg;
};
//# sourceMappingURL=helpers.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/runtime.js":
/*!***************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/runtime.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BROWSER_AGENT: () => (/* binding */ BROWSER_AGENT),
/* harmony export */   BUN_VERSION: () => (/* binding */ BUN_VERSION),
/* harmony export */   NODE_VERSION: () => (/* binding */ NODE_VERSION),
/* harmony export */   isBrowser: () => (/* binding */ isBrowser),
/* harmony export */   isBun: () => (/* binding */ isBun),
/* harmony export */   isNode: () => (/* binding */ isNode)
/* harmony export */ });
const NODE_VERSION = typeof process !== "undefined" && process.versions && process.versions.node
    ? process.versions.node
    : "unknown";
const BUN_VERSION = typeof process !== "undefined" && process.versions && process.versions.bun
    ? process.versions.bun
    : "unknown";
const BROWSER_AGENT = typeof window !== "undefined" && window.navigator && window.navigator.userAgent
    ? window.navigator.userAgent
    : "unknown";
const isBrowser = () => BROWSER_AGENT !== "unknown";
const isNode = () => NODE_VERSION !== "unknown";
const isBun = () => BUN_VERSION !== "unknown";
//# sourceMappingURL=runtime.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/lib/version.js":
/*!***************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/lib/version.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
const version = "3.13.0";
//# sourceMappingURL=version.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractClient.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/AbstractClient.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractClient: () => (/* binding */ AbstractClient),
/* harmony export */   noop: () => (/* binding */ noop)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lib_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/constants */ "./node_modules/@deepgram/sdk/dist/module/lib/constants.js");
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _lib_helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/helpers */ "./node_modules/@deepgram/sdk/dist/module/lib/helpers.js");




const noop = () => { };
/**
 * Represents an abstract Deepgram client that provides a base implementation for interacting with the Deepgram API.
 *
 * The `AbstractClient` class is responsible for:
 * - Initializing the Deepgram API key
 * - Applying default options for the client and namespace
 * - Providing a namespace for organizing API requests
 *
 * Subclasses of `AbstractClient` should implement the specific functionality for interacting with the Deepgram API.
 */
class AbstractClient extends events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    /**
     * Constructs a new instance of the DeepgramClient class with the provided options.
     *
     * @param options - The options to configure the DeepgramClient instance.
     * @param options.key - The Deepgram API key to use for authentication. If not provided, the `DEEPGRAM_API_KEY` environment variable will be used.
     * @param options.global - Global options that apply to all requests made by the DeepgramClient instance.
     * @param options.global.fetch - Options to configure the fetch requests made by the DeepgramClient instance.
     * @param options.global.fetch.options - Additional options to pass to the fetch function, such as `url` and `headers`.
     * @param options.namespace - Options specific to a particular namespace within the DeepgramClient instance.
     */
    constructor(options) {
        super();
        this.factory = undefined;
        this.namespace = "global";
        this.version = "v1";
        this.baseUrl = _lib_constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_URL;
        this.logger = noop;
        let key;
        if (typeof options.key === "function") {
            this.factory = options.key;
            key = this.factory();
        }
        else {
            key = options.key;
        }
        if (!key) {
            key = process.env.DEEPGRAM_API_KEY;
        }
        if (!key) {
            throw new _lib_errors__WEBPACK_IMPORTED_MODULE_2__.DeepgramError("A deepgram API key is required.");
        }
        this.key = key;
        options = (0,_lib_helpers__WEBPACK_IMPORTED_MODULE_3__.convertLegacyOptions)(options);
        /**
         * Apply default options.
         */
        this.options = (0,_lib_helpers__WEBPACK_IMPORTED_MODULE_3__.applyDefaults)(options, _lib_constants__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_OPTIONS);
    }
    /**
     * Sets the version for the current instance of the Deepgram API and returns the instance.
     *
     * @param version - The version to set for the Deepgram API instance. Defaults to "v1" if not provided.
     * @returns The current instance of the AbstractClient with the updated version.
     */
    v(version = "v1") {
        this.version = version;
        return this;
    }
    /**
     * Gets the namespace options for the current instance of the AbstractClient.
     * The namespace options include the default options merged with the global options,
     * and the API key for the current instance.
     *
     * @returns The namespace options for the current instance.
     */
    get namespaceOptions() {
        const defaults = (0,_lib_helpers__WEBPACK_IMPORTED_MODULE_3__.applyDefaults)(this.options[this.namespace], this.options.global);
        return Object.assign(Object.assign({}, defaults), { key: this.key });
    }
    /**
     * Generates a URL for an API endpoint with optional query parameters and transcription options.
     *
     * @param endpoint - The API endpoint URL, which may contain placeholders for fields.
     * @param fields - An optional object containing key-value pairs to replace placeholders in the endpoint URL.
     * @param transcriptionOptions - Optional transcription options to include as query parameters in the URL.
     * @returns A URL object representing the constructed API request URL.
     */
    getRequestUrl(endpoint, fields = { version: this.version }, transcriptionOptions) {
        /**
         * If we pass in fields without a version, set a version.
         */
        fields.version = this.version;
        /**
         * Version and template the endpoint for input argument..
         */
        endpoint = endpoint.replace(/:(\w+)/g, function (_, key) {
            return fields[key];
        });
        /**
         * Create a URL object.
         */
        const url = new URL(endpoint, this.baseUrl);
        /**
         * If there are transcription options, append them to the request as URL querystring parameters
         */
        if (transcriptionOptions) {
            (0,_lib_helpers__WEBPACK_IMPORTED_MODULE_3__.appendSearchParams)(url.searchParams, transcriptionOptions);
        }
        return url;
    }
    /**
     * Logs the message.
     *
     * For customized logging, `this.logger` can be overridden.
     */
    log(kind, msg, data) {
        this.logger(kind, msg, data);
    }
}
//# sourceMappingURL=AbstractClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractLiveClient.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/AbstractLiveClient.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractLiveClient: () => (/* binding */ AbstractLiveClient),
/* harmony export */   AbstractWsClient: () => (/* binding */ AbstractLiveClient)
/* harmony export */ });
/* harmony import */ var _AbstractClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractClient.js");
/* harmony import */ var _lib_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/constants */ "./node_modules/@deepgram/sdk/dist/module/lib/constants.js");
/* harmony import */ var _lib_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/runtime */ "./node_modules/@deepgram/sdk/dist/module/lib/runtime.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * Represents an error that occurred in a WebSocket-like connection.
 * @property {any} error - The underlying error object.
 * @property {string} message - A human-readable error message.
 * @property {string} type - The type of the error.
 */
// interface WebSocketLikeError {
//   error: any;
//   message: string;
//   type: string;
// }
/**
 * Indicates whether a native WebSocket implementation is available in the current environment.
 */
const NATIVE_WEBSOCKET_AVAILABLE = typeof WebSocket !== "undefined";
/**
 * Represents an abstract live client that extends the AbstractClient class.
 * The AbstractLiveClient class provides functionality for connecting, reconnecting, and disconnecting a WebSocket connection, as well as sending data over the connection.
 * Subclasses of this class are responsible for setting up the connection event handlers.
 *
 * @abstract
 */
class AbstractLiveClient extends _AbstractClient__WEBPACK_IMPORTED_MODULE_0__.AbstractClient {
    constructor(options) {
        super(options);
        this.conn = null;
        this.sendBuffer = [];
        /**
         * Reconnects the socket using new or existing transcription options.
         *
         * @param options - The transcription options to use when reconnecting the socket.
         */
        this.reconnect = _AbstractClient__WEBPACK_IMPORTED_MODULE_0__.noop;
        const { key, websocket: { options: websocketOptions, client }, } = this.namespaceOptions;
        if (this.proxy) {
            this.baseUrl = websocketOptions.proxy.url;
        }
        else {
            this.baseUrl = websocketOptions.url;
        }
        if (client) {
            this.transport = client;
        }
        else {
            this.transport = null;
        }
        if (websocketOptions._nodeOnlyHeaders) {
            this.headers = websocketOptions._nodeOnlyHeaders;
        }
        else {
            this.headers = {};
        }
        if (!("Authorization" in this.headers)) {
            this.headers["Authorization"] = `Token ${key}`; // Add default token
        }
    }
    /**
     * Connects the socket, unless already connected.
     *
     * @protected Can only be called from within the class.
     */
    connect(transcriptionOptions, endpoint) {
        if (this.conn) {
            return;
        }
        this.reconnect = (options = transcriptionOptions) => {
            this.connect(options, endpoint);
        };
        const requestUrl = this.getRequestUrl(endpoint, {}, transcriptionOptions);
        /**
         * Custom websocket transport
         */
        if (this.transport) {
            this.conn = new this.transport(requestUrl, undefined, {
                headers: this.headers,
            });
            return;
        }
        /**
         * @summary Bun websocket transport has a bug where it's native WebSocket implementation messes up the headers
         * @summary This is a workaround to use the WS package for the websocket connection instead of the native Bun WebSocket
         * @summary you can track the issue here
         * @link https://github.com/oven-sh/bun/issues/4529
         */
        if ((0,_lib_runtime__WEBPACK_IMPORTED_MODULE_2__.isBun)()) {
            __webpack_require__.e(/*! import() */ "node_modules_ws_browser_js").then(__webpack_require__.t.bind(__webpack_require__, /*! ws */ "./node_modules/ws/browser.js", 23)).then(({ default: WS }) => {
                this.conn = new WS(requestUrl, {
                    headers: this.headers,
                });
                console.log(`Using WS package`);
                this.setupConnection();
            });
            return;
        }
        /**
         * Native websocket transport (browser)
         */
        if (NATIVE_WEBSOCKET_AVAILABLE) {
            this.conn = new WebSocket(requestUrl, ["token", this.namespaceOptions.key]);
            this.setupConnection();
            return;
        }
        /**
         * Dummy websocket
         */
        this.conn = new WSWebSocketDummy(requestUrl, undefined, {
            close: () => {
                this.conn = null;
            },
        });
        /**
         * WS package for node environment
         */
        __webpack_require__.e(/*! import() */ "node_modules_ws_browser_js").then(__webpack_require__.t.bind(__webpack_require__, /*! ws */ "./node_modules/ws/browser.js", 23)).then(({ default: WS }) => {
            this.conn = new WS(requestUrl, undefined, {
                headers: this.headers,
            });
            this.setupConnection();
        });
    }
    /**
     * Disconnects the socket from the client.
     *
     * @param code A numeric status code to send on disconnect.
     * @param reason A custom reason for the disconnect.
     */
    disconnect(code, reason) {
        if (this.conn) {
            this.conn.onclose = function () { }; // noop
            if (code) {
                this.conn.close(code, reason !== null && reason !== void 0 ? reason : "");
            }
            else {
                this.conn.close();
            }
            this.conn = null;
        }
    }
    /**
     * Returns the current connection state of the WebSocket connection.
     *
     * @returns The current connection state of the WebSocket connection.
     */
    connectionState() {
        switch (this.conn && this.conn.readyState) {
            case _lib_constants__WEBPACK_IMPORTED_MODULE_1__.SOCKET_STATES.connecting:
                return _lib_constants__WEBPACK_IMPORTED_MODULE_1__.CONNECTION_STATE.Connecting;
            case _lib_constants__WEBPACK_IMPORTED_MODULE_1__.SOCKET_STATES.open:
                return _lib_constants__WEBPACK_IMPORTED_MODULE_1__.CONNECTION_STATE.Open;
            case _lib_constants__WEBPACK_IMPORTED_MODULE_1__.SOCKET_STATES.closing:
                return _lib_constants__WEBPACK_IMPORTED_MODULE_1__.CONNECTION_STATE.Closing;
            default:
                return _lib_constants__WEBPACK_IMPORTED_MODULE_1__.CONNECTION_STATE.Closed;
        }
    }
    /**
     * Returns the current ready state of the WebSocket connection.
     *
     * @returns The current ready state of the WebSocket connection.
     */
    getReadyState() {
        var _a, _b;
        return (_b = (_a = this.conn) === null || _a === void 0 ? void 0 : _a.readyState) !== null && _b !== void 0 ? _b : _lib_constants__WEBPACK_IMPORTED_MODULE_1__.SOCKET_STATES.closed;
    }
    /**
     * Returns `true` is the connection is open.
     */
    isConnected() {
        return this.connectionState() === _lib_constants__WEBPACK_IMPORTED_MODULE_1__.CONNECTION_STATE.Open;
    }
    /**
     * Sends data to the Deepgram API via websocket connection
     * @param data Audio data to send to Deepgram
     *
     * Conforms to RFC #146 for Node.js - does not send an empty byte.
     * @see https://github.com/deepgram/deepgram-python-sdk/issues/146
     */
    send(data) {
        const callback = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (data instanceof Blob) {
                if (data.size === 0) {
                    this.log("warn", "skipping `send` for zero-byte blob", data);
                    return;
                }
                data = yield data.arrayBuffer();
            }
            if (typeof data !== "string") {
                if (!(data === null || data === void 0 ? void 0 : data.byteLength)) {
                    this.log("warn", "skipping `send` for zero-byte payload", data);
                    return;
                }
            }
            (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(data);
        });
        if (this.isConnected()) {
            callback();
        }
        else {
            this.sendBuffer.push(callback);
        }
    }
    /**
     * Determines whether the current instance should proxy requests.
     * @returns {boolean} true if the current instance should proxy requests; otherwise, false
     */
    get proxy() {
        var _a;
        return this.key === "proxy" && !!((_a = this.namespaceOptions.websocket.options.proxy) === null || _a === void 0 ? void 0 : _a.url);
    }
}
class WSWebSocketDummy {
    constructor(address, _protocols, options) {
        this.binaryType = "arraybuffer";
        this.onclose = () => { };
        this.onerror = () => { };
        this.onmessage = () => { };
        this.onopen = () => { };
        this.readyState = _lib_constants__WEBPACK_IMPORTED_MODULE_1__.SOCKET_STATES.connecting;
        this.send = () => { };
        this.url = null;
        this.url = address.toString();
        this.close = options.close;
    }
}

//# sourceMappingURL=AbstractLiveClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractRestClient: () => (/* binding */ AbstractRestClient),
/* harmony export */   AbstractRestfulClient: () => (/* binding */ AbstractRestClient)
/* harmony export */ });
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _lib_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/fetch */ "./node_modules/@deepgram/sdk/dist/module/lib/fetch.js");
/* harmony import */ var _AbstractClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractClient.js");
/* harmony import */ var _lib_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/runtime */ "./node_modules/@deepgram/sdk/dist/module/lib/runtime.js");
/* harmony import */ var deepmerge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! deepmerge */ "./node_modules/deepmerge/dist/cjs.js");
/* harmony import */ var deepmerge__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(deepmerge__WEBPACK_IMPORTED_MODULE_4__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





/**
 * An abstract class that extends `AbstractClient` and provides a base implementation for a REST-based API client.
 * This class handles authentication, error handling, and other common functionality for REST API clients.
 */
class AbstractRestClient extends _AbstractClient__WEBPACK_IMPORTED_MODULE_2__.AbstractClient {
    /**
     * Constructs a new instance of the `AbstractRestClient` class with the provided options.
     *
     * @param options - The client options to use for this instance.
     * @throws {DeepgramError} If the client is being used in a browser and no proxy is provided.
     */
    constructor(options) {
        super(options);
        if ((0,_lib_runtime__WEBPACK_IMPORTED_MODULE_3__.isBrowser)() && !this.proxy) {
            throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramError("Due to CORS we are unable to support REST-based API calls to our API from the browser. Please consider using a proxy: https://dpgr.am/js-proxy for more information.");
        }
        this.fetch = (0,_lib_fetch__WEBPACK_IMPORTED_MODULE_1__.fetchWithAuth)(this.key, this.namespaceOptions.fetch.client);
        if (this.proxy) {
            this.baseUrl = this.namespaceOptions.fetch.options.proxy.url;
        }
        else {
            this.baseUrl = this.namespaceOptions.fetch.options.url;
        }
    }
    /**
     * Constructs an error message from the provided error object.
     *
     * @param err - The error object to extract the error message from.
     * @returns The constructed error message.
     */
    _getErrorMessage(err) {
        return err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    }
    /**
     * Handles an error that occurred during a request.
     *
     * @param error - The error that occurred during the request.
     * @param reject - The rejection function to call with the error.
     * @returns A Promise that resolves when the error has been handled.
     */
    _handleError(error, reject) {
        return __awaiter(this, void 0, void 0, function* () {
            const Res = yield (0,_lib_fetch__WEBPACK_IMPORTED_MODULE_1__.resolveResponse)();
            if (error instanceof Res) {
                error
                    .json()
                    .then((err) => {
                    reject(new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramApiError(this._getErrorMessage(err), error.status || 500));
                })
                    .catch((err) => {
                    reject(new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramUnknownError(this._getErrorMessage(err), err));
                });
            }
            else {
                reject(new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramUnknownError(this._getErrorMessage(error), error));
            }
        });
    }
    /**
     * Constructs the options object to be used for a fetch request.
     *
     * @param method - The HTTP method to use for the request, such as "GET", "POST", "PUT", "PATCH", or "DELETE".
     * @param bodyOrOptions - For "POST", "PUT", and "PATCH" requests, the request body as a string, Buffer, or Readable stream. For "GET" and "DELETE" requests, the fetch options to use.
     * @param options - Additional fetch options to use for the request.
     * @returns The constructed fetch options object.
     */
    _getRequestOptions(method, bodyOrOptions, options) {
        let reqOptions = { method };
        if (method === "GET" || method === "DELETE") {
            reqOptions = Object.assign(Object.assign({}, reqOptions), bodyOrOptions);
        }
        else {
            reqOptions = Object.assign(Object.assign({ duplex: "half", body: bodyOrOptions }, reqOptions), options);
        }
        return deepmerge__WEBPACK_IMPORTED_MODULE_4___default()(this.namespaceOptions.fetch.options, reqOptions, { clone: false });
    }
    _handleRequest(method, url, bodyOrOptions, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const fetcher = this.fetch;
                fetcher(url, this._getRequestOptions(method, bodyOrOptions, options))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    resolve(result);
                })
                    .catch((error) => this._handleError(error, reject));
            });
        });
    }
    /**
     * Handles an HTTP GET request using the provided URL and optional request options.
     *
     * @param url - The URL to send the GET request to.
     * @param options - Additional fetch options to use for the GET request.
     * @returns A Promise that resolves to the Response object for the GET request.
     */
    get(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._handleRequest("GET", url, options);
        });
    }
    /**
     * Handles an HTTP POST request using the provided URL, request body, and optional request options.
     *
     * @param url - The URL to send the POST request to.
     * @param body - The request body as a string, Buffer, or Readable stream.
     * @param options - Additional fetch options to use for the POST request.
     * @returns A Promise that resolves to the Response object for the POST request.
     */
    post(url, body, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._handleRequest("POST", url, body, options);
        });
    }
    /**
     * Handles an HTTP PUT request using the provided URL, request body, and optional request options.
     *
     * @param url - The URL to send the PUT request to.
     * @param body - The request body as a string, Buffer, or Readable stream.
     * @param options - Additional fetch options to use for the PUT request.
     * @returns A Promise that resolves to the Response object for the PUT request.
     */
    put(url, body, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._handleRequest("PUT", url, body, options);
        });
    }
    /**
     * Handles an HTTP PATCH request using the provided URL, request body, and optional request options.
     *
     * @param url - The URL to send the PATCH request to.
     * @param body - The request body as a string, Buffer, or Readable stream.
     * @param options - Additional fetch options to use for the PATCH request.
     * @returns A Promise that resolves to the Response object for the PATCH request.
     */
    patch(url, body, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._handleRequest("PATCH", url, body, options);
        });
    }
    /**
     * Handles an HTTP DELETE request using the provided URL and optional request options.
     *
     * @param url - The URL to send the DELETE request to.
     * @param options - Additional fetch options to use for the DELETE request.
     * @returns A Promise that resolves to the Response object for the DELETE request.
     */
    delete(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._handleRequest("DELETE", url, options);
        });
    }
    /**
     * Determines whether the current instance should proxy requests.
     * @returns {boolean} true if the current instance should proxy requests; otherwise, false
     */
    get proxy() {
        var _a;
        return this.key === "proxy" && !!((_a = this.namespaceOptions.fetch.options.proxy) === null || _a === void 0 ? void 0 : _a.url);
    }
}

//# sourceMappingURL=AbstractRestClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/AgentLiveClient.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/AgentLiveClient.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgentLiveClient: () => (/* binding */ AgentLiveClient)
/* harmony export */ });
/* harmony import */ var _lib_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/constants */ "./node_modules/@deepgram/sdk/dist/module/lib/constants.js");
/* harmony import */ var _lib_enums_AgentEvents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/enums/AgentEvents */ "./node_modules/@deepgram/sdk/dist/module/lib/enums/AgentEvents.js");
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _AbstractLiveClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AbstractLiveClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractLiveClient.js");




class AgentLiveClient extends _AbstractLiveClient__WEBPACK_IMPORTED_MODULE_3__.AbstractLiveClient {
    constructor(options, endpoint = "/:version/agent/converse") {
        var _a, _b, _c, _d;
        super(options);
        this.namespace = "agent";
        this.baseUrl = (_d = (_c = (_b = (_a = options.agent) === null || _a === void 0 ? void 0 : _a.websocket) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.url) !== null && _d !== void 0 ? _d : _lib_constants__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_AGENT_URL;
        this.connect({}, endpoint);
    }
    /**
     * Sets up the connection event handlers.
     * This method is responsible for handling the various events that can occur on the WebSocket connection, such as opening, closing, and receiving messages.
     * - When the connection is opened, it emits the `AgentEvents.Open` event.
     * - When the connection is closed, it emits the `AgentEvents.Close` event.
     * - When an error occurs on the connection, it emits the `AgentEvents.Error` event.
     * - When a message is received, it parses the message and emits the appropriate event based on the message type.
     */
    setupConnection() {
        if (this.conn) {
            this.conn.onopen = () => {
                this.emit(_lib_enums_AgentEvents__WEBPACK_IMPORTED_MODULE_1__.AgentEvents.Open, this);
            };
            this.conn.onclose = (event) => {
                this.emit(_lib_enums_AgentEvents__WEBPACK_IMPORTED_MODULE_1__.AgentEvents.Close, event);
            };
            this.conn.onerror = (event) => {
                this.emit(_lib_enums_AgentEvents__WEBPACK_IMPORTED_MODULE_1__.AgentEvents.Error, event);
            };
            this.conn.onmessage = (event) => {
                this.handleMessage(event);
            };
        }
    }
    /**
     * Handles incoming messages from the WebSocket connection.
     * @param event - The MessageEvent object representing the received message.
     */
    handleMessage(event) {
        if (typeof event.data === "string") {
            try {
                const data = JSON.parse(event.data);
                this.handleTextMessage(data);
            }
            catch (error) {
                this.emit(_lib_enums_AgentEvents__WEBPACK_IMPORTED_MODULE_1__.AgentEvents.Error, {
                    event,
                    data: event.data,
                    message: "Unable to parse `data` as JSON.",
                    error,
                });
            }
        }
        else if (event.data instanceof Blob) {
            event.data.arrayBuffer().then((buffer) => {
                this.handleBinaryMessage(Buffer.from(buffer));
            });
        }
        else if (event.data instanceof ArrayBuffer) {
            this.handleBinaryMessage(Buffer.from(event.data));
        }
        else if (Buffer.isBuffer(event.data)) {
            this.handleBinaryMessage(event.data);
        }
        else {
            console.log("Received unknown data type", event.data);
            this.emit(_lib_enums_AgentEvents__WEBPACK_IMPORTED_MODULE_1__.AgentEvents.Error, {
                event,
                message: "Received unknown data type.",
            });
        }
    }
    /**
     * Handles binary messages received from the WebSocket connection.
     * @param data - The binary data.
     */
    handleBinaryMessage(data) {
        this.emit(_lib_enums_AgentEvents__WEBPACK_IMPORTED_MODULE_1__.AgentEvents.Audio, data);
    }
    /**
     * Handles text messages received from the WebSocket connection.
     * @param data - The parsed JSON data.
     */
    handleTextMessage(data) {
        if (data.type in _lib_enums_AgentEvents__WEBPACK_IMPORTED_MODULE_1__.AgentEvents) {
            this.emit(data.type, data);
        }
        else {
            this.emit(_lib_enums_AgentEvents__WEBPACK_IMPORTED_MODULE_1__.AgentEvents.Unhandled, data);
        }
    }
    /**
     * To be called with your model configuration BEFORE sending
     * any audio data.
     * @param options - The SettingsConfiguration object.
     */
    configure(options) {
        var _a, _b, _c;
        if (!((_a = options.agent.listen) === null || _a === void 0 ? void 0 : _a.provider.model.startsWith("nova-3")) &&
            ((_c = (_b = options.agent.listen) === null || _b === void 0 ? void 0 : _b.provider.keyterms) === null || _c === void 0 ? void 0 : _c.length)) {
            throw new _lib_errors__WEBPACK_IMPORTED_MODULE_2__.DeepgramError("Keyterms are only supported with the Nova 3 models.");
        }
        const string = JSON.stringify(Object.assign({ type: "Settings" }, options));
        this.send(string);
    }
    /**
     * Provide new system prompt to the LLM.
     * @param prompt - The system prompt to provide.
     */
    updatePrompt(prompt) {
        this.send(JSON.stringify({ type: "UpdatePrompt", prompt }));
    }
    /**
     * Change the speak model.
     * @param model - The new model to use.
     */
    updateSpeak(speakConfig) {
        this.send(JSON.stringify({ type: "UpdateSpeak", speak: speakConfig }));
    }
    /**
     * Immediately trigger an agent message. If this message
     * is sent while the user is speaking, or while the server is in the
     * middle of sending audio, then the request will be ignored and an InjectionRefused
     * event will be emitted.
     * @example "Hold on while I look that up for you."
     * @example "Are you still on the line?"
     * @param content - The message to speak.
     */
    injectAgentMessage(content) {
        this.send(JSON.stringify({ type: "InjectAgentMessage", content }));
    }
    /**
     * Respond to a function call request.
     * @param response  - The response to the function call request.
     */
    functionCallResponse(response) {
        this.send(JSON.stringify(Object.assign({ type: "FunctionCallResponse" }, response)));
    }
    /**
     * Send a keepalive to avoid closing the websocket while you
     * are not transmitting audio. This should be sent at least
     * every 8 seconds.
     */
    keepAlive() {
        this.send(JSON.stringify({ type: "KeepAlive" }));
    }
}
//# sourceMappingURL=AgentLiveClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/AuthRestClient.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/AuthRestClient.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthRestClient: () => (/* binding */ AuthRestClient)
/* harmony export */ });
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _AbstractRestClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


class AuthRestClient extends _AbstractRestClient__WEBPACK_IMPORTED_MODULE_1__.AbstractRestClient {
    constructor() {
        super(...arguments);
        this.namespace = "auth";
    }
    /**
     * Generates a new temporary token for the Deepgram API.
     * @param endpoint Optional custom endpoint to use for the request. Defaults to ":version/auth/grant".
     * @returns Object containing the result of the request or an error if one occurred. Result will contain access_token and expires_in properties.
     */
    grantToken(endpoint = ":version/auth/grant") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint);
                const result = yield this.post(requestUrl, "").then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
}
//# sourceMappingURL=AuthRestClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/ListenClient.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/ListenClient.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ListenClient: () => (/* binding */ ListenClient)
/* harmony export */ });
/* harmony import */ var _AbstractClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractClient.js");
/* harmony import */ var _ListenLiveClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ListenLiveClient */ "./node_modules/@deepgram/sdk/dist/module/packages/ListenLiveClient.js");
/* harmony import */ var _ListenRestClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ListenRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/ListenRestClient.js");



/**
 * The `ListenClient` class extends the `AbstractClient` class and provides access to the "listen" namespace.
 * It exposes two methods:
 *
 * 1. `prerecorded()`: Returns a `ListenRestClient` instance for interacting with the prerecorded listen API.
 * 2. `live(transcriptionOptions: LiveSchema = {}, endpoint = ":version/listen")`: Returns a `ListenLiveClient` instance for interacting with the live listen API, with the provided transcription options and endpoint.
 */
class ListenClient extends _AbstractClient__WEBPACK_IMPORTED_MODULE_0__.AbstractClient {
    constructor() {
        super(...arguments);
        this.namespace = "listen";
    }
    /**
     * Returns a `ListenRestClient` instance for interacting with the prerecorded listen API.
     */
    get prerecorded() {
        return new _ListenRestClient__WEBPACK_IMPORTED_MODULE_2__.ListenRestClient(this.options);
    }
    /**
     * Returns a `ListenLiveClient` instance for interacting with the live listen API, with the provided transcription options and endpoint.
     * @param {LiveSchema} [transcriptionOptions={}] - The transcription options to use for the live listen API.
     * @param {string} [endpoint=":version/listen"] - The endpoint to use for the live listen API.
     * @returns {ListenLiveClient} - A `ListenLiveClient` instance for interacting with the live listen API.
     */
    live(transcriptionOptions = {}, endpoint = ":version/listen") {
        return new _ListenLiveClient__WEBPACK_IMPORTED_MODULE_1__.ListenLiveClient(this.options, transcriptionOptions, endpoint);
    }
}
//# sourceMappingURL=ListenClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/ListenLiveClient.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/ListenLiveClient.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ListenLiveClient: () => (/* binding */ ListenLiveClient),
/* harmony export */   LiveClient: () => (/* binding */ ListenLiveClient)
/* harmony export */ });
/* harmony import */ var _AbstractLiveClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractLiveClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractLiveClient.js");
/* harmony import */ var _lib_enums__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/enums */ "./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveTranscriptionEvents.js");
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");



/**
 * The `ListenLiveClient` class extends the `AbstractLiveClient` class and provides functionality for setting up and managing a WebSocket connection for live transcription.
 *
 * The constructor takes in `DeepgramClientOptions` and an optional `LiveSchema` object, as well as an optional `endpoint` string. It then calls the `connect` method of the parent `AbstractLiveClient` class to establish the WebSocket connection.
 *
 * The `setupConnection` method is responsible for handling the various events that can occur on the WebSocket connection, such as opening, closing, and receiving messages. It sets up event handlers for these events and emits the appropriate events based on the message type.
 *
 * The `configure` method allows you to send additional configuration options to the connected session, such as enabling numerals.
 *
 * The `keepAlive` method sends a "KeepAlive" message to the server to maintain the connection.
 *
 * The `requestClose` method requests the server to close the connection.
 *
 * The `finish` method is deprecated as of version 3.4 and will be removed in version 4.0. Use `requestClose` instead.
 */
class ListenLiveClient extends _AbstractLiveClient__WEBPACK_IMPORTED_MODULE_0__.AbstractLiveClient {
    /**
     * Constructs a new `ListenLiveClient` instance with the provided options.
     *
     * @param options - The `DeepgramClientOptions` to use for the client connection.
     * @param transcriptionOptions - An optional `LiveSchema` object containing additional configuration options for the live transcription.
     * @param endpoint - An optional string representing the WebSocket endpoint to connect to. Defaults to `:version/listen`.
     */
    constructor(options, transcriptionOptions = {}, endpoint = ":version/listen") {
        var _a, _b;
        super(options);
        this.namespace = "listen";
        if (((_a = transcriptionOptions.keyterm) === null || _a === void 0 ? void 0 : _a.length) && !((_b = transcriptionOptions.model) === null || _b === void 0 ? void 0 : _b.startsWith("nova-3"))) {
            throw new _lib_errors__WEBPACK_IMPORTED_MODULE_2__.DeepgramError("Keyterms are only supported with the Nova 3 models.");
        }
        this.connect(transcriptionOptions, endpoint);
    }
    /**
     * Sets up the connection event handlers.
     * This method is responsible for handling the various events that can occur on the WebSocket connection, such as opening, closing, and receiving messages.
     * - When the connection is opened, it emits the `LiveTranscriptionEvents.Open` event.
     * - When the connection is closed, it emits the `LiveTranscriptionEvents.Close` event.
     * - When an error occurs on the connection, it emits the `LiveTranscriptionEvents.Error` event.
     * - When a message is received, it parses the message and emits the appropriate event based on the message type, such as `LiveTranscriptionEvents.Metadata`, `LiveTranscriptionEvents.Transcript`, `LiveTranscriptionEvents.UtteranceEnd`, and `LiveTranscriptionEvents.SpeechStarted`.
     */
    setupConnection() {
        if (this.conn) {
            this.conn.onopen = () => {
                this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.Open, this);
            };
            this.conn.onclose = (event) => {
                this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.Close, event);
            };
            this.conn.onerror = (event) => {
                this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.Error, event);
            };
            this.conn.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data.toString());
                    if (data.type === _lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.Metadata) {
                        this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.Metadata, data);
                    }
                    else if (data.type === _lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.Transcript) {
                        this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.Transcript, data);
                    }
                    else if (data.type === _lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.UtteranceEnd) {
                        this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.UtteranceEnd, data);
                    }
                    else if (data.type === _lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.SpeechStarted) {
                        this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.SpeechStarted, data);
                    }
                    else {
                        this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.Unhandled, data);
                    }
                }
                catch (error) {
                    this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTranscriptionEvents.Error, {
                        event,
                        message: "Unable to parse `data` as JSON.",
                        error,
                    });
                }
            };
        }
    }
    /**
     * Sends additional config to the connected session.
     *
     * @param config - The configuration options to apply to the LiveClient.
     * @param config.numerals - We currently only support numerals.
     */
    configure(config) {
        this.send(JSON.stringify({
            type: "Configure",
            processors: config,
        }));
    }
    /**
     * Sends a "KeepAlive" message to the server to maintain the connection.
     */
    keepAlive() {
        this.send(JSON.stringify({
            type: "KeepAlive",
        }));
    }
    /**
     * Sends a "Finalize" message to flush any transcription sitting in the server's buffer.
     */
    finalize() {
        this.send(JSON.stringify({
            type: "Finalize",
        }));
    }
    /**
     * @deprecated Since version 3.4. Will be removed in version 4.0. Use `requestClose` instead.
     */
    finish() {
        this.requestClose();
    }
    /**
     * Requests the server close the connection.
     */
    requestClose() {
        this.send(JSON.stringify({
            type: "CloseStream",
        }));
    }
}

//# sourceMappingURL=ListenLiveClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/ListenRestClient.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/ListenRestClient.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ListenRestClient: () => (/* binding */ ListenRestClient),
/* harmony export */   PrerecordedClient: () => (/* binding */ ListenRestClient)
/* harmony export */ });
/* harmony import */ var _lib_helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/helpers */ "./node_modules/@deepgram/sdk/dist/module/lib/helpers.js");
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _AbstractRestClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * The `ListenRestClient` class extends the `AbstractRestClient` class and provides methods for transcribing audio from URLs or files using the Deepgram API.
 *
 * The `transcribeUrl` method is used to transcribe audio from a URL synchronously. It takes a `UrlSource` object as the source, an optional `PrerecordedSchema` object as options, and an optional endpoint string. It returns a `DeepgramResponse` object containing the transcription result or an error.
 *
 * The `transcribeFile` method is used to transcribe audio from a file synchronously. It takes a `FileSource` object as the source, an optional `PrerecordedSchema` object as options, and an optional endpoint string. It returns a `DeepgramResponse` object containing the transcription result or an error.
 *
 * The `transcribeUrlCallback` method is used to transcribe audio from a URL asynchronously. It takes a `UrlSource` object as the source, a `CallbackUrl` object as the callback, an optional `PrerecordedSchema` object as options, and an optional endpoint string. It returns a `DeepgramResponse` object containing the transcription result or an error.
 *
 * The `transcribeFileCallback` method is used to transcribe audio from a file asynchronously. It takes a `FileSource` object as the source, a `CallbackUrl` object as the callback, an optional `PrerecordedSchema` object as options, and an optional endpoint string. It returns a `DeepgramResponse` object containing the transcription result or an error.
 */
class ListenRestClient extends _AbstractRestClient__WEBPACK_IMPORTED_MODULE_2__.AbstractRestClient {
    constructor() {
        super(...arguments);
        this.namespace = "listen";
    }
    /**
     * Transcribes audio from a URL synchronously.
     *
     * @param source - The URL source object containing the audio URL to transcribe.
     * @param options - An optional `PrerecordedSchema` object containing additional options for the transcription.
     * @param endpoint - An optional endpoint string to use for the transcription request.
     * @returns A `DeepgramResponse` object containing the transcription result or an error.
     */
    transcribeUrl(source, options, endpoint = ":version/listen") {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body;
                if ((0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.isUrlSource)(source)) {
                    body = JSON.stringify(source);
                }
                else {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Unknown transcription source type");
                }
                if (options !== undefined && "callback" in options) {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Callback cannot be provided as an option to a synchronous transcription. Use `transcribeUrlCallback` or `transcribeFileCallback` instead.");
                }
                if (((_a = options === null || options === void 0 ? void 0 : options.keyterm) === null || _a === void 0 ? void 0 : _a.length) && !((_b = options.model) === null || _b === void 0 ? void 0 : _b.startsWith("nova-3"))) {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Keyterms are only supported with the Nova 3 models.");
                }
                const requestUrl = this.getRequestUrl(endpoint, {}, Object.assign({}, options));
                const result = yield this.post(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_1__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Transcribes audio from a file asynchronously.
     *
     * @param source - The file source object containing the audio file to transcribe.
     * @param options - An optional `PrerecordedSchema` object containing additional options for the transcription.
     * @param endpoint - An optional endpoint string to use for the transcription request.
     * @returns A `DeepgramResponse` object containing the transcription result or an error.
     */
    transcribeFile(source, options, endpoint = ":version/listen") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body;
                if ((0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.isFileSource)(source)) {
                    body = source;
                }
                else {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Unknown transcription source type");
                }
                if (options !== undefined && "callback" in options) {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Callback cannot be provided as an option to a synchronous transcription. Use `transcribeUrlCallback` or `transcribeFileCallback` instead.");
                }
                const requestUrl = this.getRequestUrl(endpoint, {}, Object.assign({}, options));
                const result = yield this.post(requestUrl, body, {
                    headers: { "Content-Type": "deepgram/audio+video" },
                }).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_1__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Transcribes audio from a URL asynchronously.
     *
     * @param source - The URL source object containing the audio file to transcribe.
     * @param callback - The callback URL to receive the transcription result.
     * @param options - An optional `PrerecordedSchema` object containing additional options for the transcription.
     * @param endpoint - An optional endpoint string to use for the transcription request.
     * @returns A `DeepgramResponse` object containing the transcription result or an error.
     */
    transcribeUrlCallback(source, callback, options, endpoint = ":version/listen") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body;
                if ((0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.isUrlSource)(source)) {
                    body = JSON.stringify(source);
                }
                else {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Unknown transcription source type");
                }
                const requestUrl = this.getRequestUrl(endpoint, {}, Object.assign(Object.assign({}, options), { callback: callback.toString() }));
                const result = yield this.post(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_1__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Transcribes audio from a file asynchronously.
     *
     * @param source - The file source object containing the audio file to transcribe.
     * @param callback - The callback URL to receive the transcription result.
     * @param options - An optional `PrerecordedSchema` object containing additional options for the transcription.
     * @param endpoint - An optional endpoint string to use for the transcription request.
     * @returns A `DeepgramResponse` object containing the transcription result or an error.
     */
    transcribeFileCallback(source, callback, options, endpoint = ":version/listen") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body;
                if ((0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.isFileSource)(source)) {
                    body = source;
                }
                else {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Unknown transcription source type");
                }
                const requestUrl = this.getRequestUrl(endpoint, {}, Object.assign(Object.assign({}, options), { callback: callback.toString() }));
                const result = yield this.post(requestUrl, body, {
                    headers: { "Content-Type": "deepgram/audio+video" },
                }).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_1__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
}

//# sourceMappingURL=ListenRestClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/ManageRestClient.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/ManageRestClient.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ManageClient: () => (/* binding */ ManageRestClient),
/* harmony export */   ManageRestClient: () => (/* binding */ ManageRestClient)
/* harmony export */ });
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _AbstractRestClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


/**
 * The `ManageRestClient` class provides a set of methods for interacting with the Deepgram Manage API. It extends the `AbstractRestClient` class and provides functionality for managing projects, keys, members, invites, usage, balances, and models.
 *
 * The class has a `namespace` property that is set to `"manage"`, which is used in the construction of the request URLs.
 *
 * The methods in this class include:
 * - `getTokenDetails`: Retrieves the details of the current authentication token.
 * - `getProjects`: Retrieves a list of all projects associated with the authenticated account.
 * - `getProject`: Retrieves the details of a specific project.
 * - `updateProject`: Updates the details of a specific project.
 * - `deleteProject`: Deletes a specific project.
 * - `getProjectKeys`: Retrieves a list of all API keys associated with a specific project.
 * - `getProjectKey`: Retrieves the details of a specific API key.
 * - `createProjectKey`: Creates a new API key for a specific project.
 * - `deleteProjectKey`: Deletes a specific API key.
 * - `getProjectMembers`: Retrieves a list of all members associated with a specific project.
 * - `removeProjectMember`: Removes a specific member from a project.
 * - `getProjectMemberScopes`: Retrieves the scopes associated with a specific project member.
 * - `updateProjectMemberScope`: Updates the scopes associated with a specific project member.
 * - `getProjectInvites`: Retrieves a list of all pending invitations for a specific project.
 * - `sendProjectInvite`: Sends a new invitation to a specific email address for a project.
 * - `deleteProjectInvite`: Deletes a specific invitation for a project.
 * - `leaveProject`: Removes the authenticated user from a specific project.
 * - `getProjectUsageRequests`: Retrieves a list of all usage requests for a specific project.
 * - `getProjectUsageRequest`: Retrieves the details of a specific usage request.
 * - `getProjectUsageSummary`: Retrieves a summary of the usage for a specific project.
 * - `getProjectUsageFields`: Retrieves a list of the available usage fields for a specific project.
 * - `getProjectBalances`: Retrieves a list of all balances associated with a specific project.
 * - `getProjectBalance`: Retrieves the details of a specific balance for a project.
 * - `getAllModels`: Retrieves all models for a project.
 * - `getModel`: Retrieves a specific model.
 */
class ManageRestClient extends _AbstractRestClient__WEBPACK_IMPORTED_MODULE_1__.AbstractRestClient {
    constructor() {
        super(...arguments);
        this.namespace = "manage";
    }
    /**
     * Retrieves the details of the current authentication token.
     *
     * @returns A promise that resolves to an object containing the token details, or an error object if an error occurs.
     * @see https://developers.deepgram.com/docs/authenticating#test-request
     */
    getTokenDetails(endpoint = ":version/auth/token") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint);
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves a list of all projects associated with the authenticated user.
     *
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects".
     * @returns A promise that resolves to an object containing the list of projects, or an error object if an error occurs.
     * @see https://developers.deepgram.com/reference/get-projects
     */
    getProjects(endpoint = ":version/projects") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint);
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the details of a specific project associated with the authenticated user.
     *
     * @param projectId - The ID of the project to retrieve.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId".
     * @returns A promise that resolves to an object containing the project details, or an error object if an error occurs.
     * @see https://developers.deepgram.com/reference/get-project
     */
    getProject(projectId, endpoint = ":version/projects/:projectId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Updates an existing project associated with the authenticated user.
     *
     * @param projectId - The ID of the project to update.
     * @param options - An object containing the updated project details.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId".
     * @returns A promise that resolves to an object containing the response message, or an error object if an error occurs.
     * @see https://developers.deepgram.com/reference/update-project
     */
    updateProject(projectId, options, endpoint = ":version/projects/:projectId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId }, options);
                const body = JSON.stringify(options);
                const result = yield this.patch(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Deletes an existing project associated with the authenticated user.
     *
     * @param projectId - The ID of the project to delete.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId".
     * @returns A promise that resolves to an object containing the response message, or an error object if an error occurs.
     * @see https://developers.deepgram.com/reference/delete-project
     */
    deleteProject(projectId, endpoint = ":version/projects/:projectId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId });
                yield this.delete(requestUrl);
                return { error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves a list of project keys associated with the specified project.
     *
     * @param projectId - The ID of the project to retrieve the keys for.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/keys".
     * @returns A promise that resolves to an object containing the list of project keys, or an error object if an error occurs.
     * @see https://developers.deepgram.com/reference/list-keys
     */
    getProjectKeys(projectId, endpoint = ":version/projects/:projectId/keys") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves a specific project key associated with the specified project.
     *
     * @param projectId - The ID of the project to retrieve the key for.
     * @param keyId - The ID of the project key to retrieve.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/keys/:keyId".
     * @returns A promise that resolves to an object containing the project key, or an error object if an error occurs.
     * @see https://developers.deepgram.com/reference/get-key
     */
    getProjectKey(projectId, keyId, endpoint = ":version/projects/:projectId/keys/:keyId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, keyId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Creates a new project key for the specified project.
     *
     * @param projectId - The ID of the project to create the key for.
     * @param options - An object containing the options for creating the project key.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/keys".
     * @returns A promise that resolves to an object containing the created project key, or an error object if an error occurs.
     * @see https://developers.deepgram.com/reference/create-key
     */
    createProjectKey(projectId, options, endpoint = ":version/projects/:projectId/keys") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId }, options);
                const body = JSON.stringify(options);
                const result = yield this.post(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Deletes the specified project key.
     *
     * @param projectId - The ID of the project the key belongs to.
     * @param keyId - The ID of the key to delete.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/keys/:keyId".
     * @returns A promise that resolves to an object containing a null result and an error object if an error occurs.
     * @see https://developers.deepgram.com/reference/delete-key
     */
    deleteProjectKey(projectId, keyId, endpoint = ":version/projects/:projectId/keys/:keyId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, keyId });
                yield this.delete(requestUrl);
                return { error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the members of the specified project.
     *
     * @param projectId - The ID of the project to retrieve members for.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/members".
     * @returns A promise that resolves to an object containing the project members and an error object if an error occurs.
     * @see https://developers.deepgram.com/reference/get-members
     */
    getProjectMembers(projectId, endpoint = ":version/projects/:projectId/members") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Removes a member from the specified project.
     *
     * @param projectId - The ID of the project to remove the member from.
     * @param memberId - The ID of the member to remove.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/members/:memberId".
     * @returns A promise that resolves to an object containing a null error if the operation was successful, or an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/remove-member
     */
    removeProjectMember(projectId, memberId, endpoint = ":version/projects/:projectId/members/:memberId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, memberId });
                yield this.delete(requestUrl);
                return { error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the scopes for the specified project member.
     *
     * @param projectId - The ID of the project to retrieve the member scopes for.
     * @param memberId - The ID of the member to retrieve the scopes for.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/members/:memberId/scopes".
     * @returns A promise that resolves to an object containing the retrieved scopes or an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/get-member-scopes
     */
    getProjectMemberScopes(projectId, memberId, endpoint = ":version/projects/:projectId/members/:memberId/scopes") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, memberId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Updates the scopes for the specified project member.
     *
     * @param projectId - The ID of the project to update the member scopes for.
     * @param memberId - The ID of the member to update the scopes for.
     * @param options - An object containing the new scopes to apply to the member.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/members/:memberId/scopes".
     * @returns A promise that resolves to an object containing the result of the update operation or an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/update-scope
     */
    updateProjectMemberScope(projectId, memberId, options, endpoint = ":version/projects/:projectId/members/:memberId/scopes") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, memberId }, options);
                const body = JSON.stringify(options);
                const result = yield this.put(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the project invites for the specified project.
     *
     * @param projectId - The ID of the project to retrieve the invites for.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/invites".
     * @returns A promise that resolves to an object containing the result of the get operation or an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/list-invites
     */
    getProjectInvites(projectId, endpoint = ":version/projects/:projectId/invites") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Sends a project invite to the specified email addresses.
     *
     * @param projectId - The ID of the project to send the invite for.
     * @param options - An object containing the email addresses to invite and any additional options.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/invites".
     * @returns A promise that resolves to an object containing the result of the post operation or an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/send-invites
     */
    sendProjectInvite(projectId, options, endpoint = ":version/projects/:projectId/invites") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId }, options);
                const body = JSON.stringify(options);
                const result = yield this.post(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Deletes a project invite for the specified email address.
     *
     * @param projectId - The ID of the project to delete the invite for.
     * @param email - The email address of the invite to delete.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/invites/:email".
     * @returns A promise that resolves to an object containing a null result and an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/delete-invite
     */
    deleteProjectInvite(projectId, email, endpoint = ":version/projects/:projectId/invites/:email") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, email });
                yield this.delete(requestUrl).then((result) => result.json());
                return { error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { error };
                }
                throw error;
            }
        });
    }
    /**
     * Leaves the specified project.
     *
     * @param projectId - The ID of the project to leave.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/leave".
     * @returns A promise that resolves to an object containing a null result and an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/leave-project
     */
    leaveProject(projectId, endpoint = ":version/projects/:projectId/leave") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId });
                const result = yield this.delete(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves a list of usage requests for the specified project.
     *
     * @param projectId - The ID of the project to retrieve usage requests for.
     * @param options - An object containing options to filter the usage requests, such as pagination parameters.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/requests".
     * @returns A promise that resolves to an object containing the list of usage requests and an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/get-all-requests
     */
    getProjectUsageRequests(projectId, options, endpoint = ":version/projects/:projectId/requests") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId }, options);
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the details of a specific usage request for the specified project.
     *
     * @param projectId - The ID of the project to retrieve the usage request for.
     * @param requestId - The ID of the usage request to retrieve.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/requests/:requestId".
     * @returns A promise that resolves to an object containing the usage request details and an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/get-request
     */
    getProjectUsageRequest(projectId, requestId, endpoint = ":version/projects/:projectId/requests/:requestId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, requestId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the usage summary for the specified project.
     *
     * @param projectId - The ID of the project to retrieve the usage summary for.
     * @param options - An object containing optional parameters for the request, such as filters and pagination options.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/usage".
     * @returns A promise that resolves to an object containing the usage summary and an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/get-usage
     */
    getProjectUsageSummary(projectId, options, endpoint = ":version/projects/:projectId/usage") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId }, options);
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the usage fields for the specified project.
     *
     * @param projectId - The ID of the project to retrieve the usage fields for.
     * @param options - An object containing optional parameters for the request, such as filters and pagination options.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/usage/fields".
     * @returns A promise that resolves to an object containing the usage fields and an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/get-fields
     */
    getProjectUsageFields(projectId, options, endpoint = ":version/projects/:projectId/usage/fields") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId }, options);
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the balances for the specified project.
     *
     * @param projectId - The ID of the project to retrieve the balances for.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/balances".
     * @returns A promise that resolves to an object containing the project balances and an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/get-all-balances
     */
    getProjectBalances(projectId, endpoint = ":version/projects/:projectId/balances") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the balance for the specified project and balance ID.
     *
     * @param projectId - The ID of the project to retrieve the balance for.
     * @param balanceId - The ID of the balance to retrieve.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/projects/:projectId/balances/:balanceId".
     * @returns A promise that resolves to an object containing the project balance and an error object if an error occurred.
     * @see https://developers.deepgram.com/reference/get-balance
     */
    getProjectBalance(projectId, balanceId, endpoint = ":version/projects/:projectId/balances/:balanceId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, balanceId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves all models for a given project.
     *
     * @param projectId - The ID of the project.
     * @param endpoint - (optional) The endpoint URL for retrieving models. Defaults to ":version/projects/:projectId/models".
     * @returns A promise that resolves to a DeepgramResponse containing the GetModelsResponse.
     * @example
     * ```typescript
     * import { createClient } from "@deepgram/sdk";
     *
     * const deepgram = createClient(DEEPGRAM_API_KEY);
     * const { result: models, error } = deepgram.manage.getAllModels("projectId");
     *
     * if (error) {
     *   console.error(error);
     * } else {
     *   console.log(models);
     * }
     * ```
     */
    getAllModels(projectId, options = {}, endpoint = ":version/projects/:projectId/models") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId }, options);
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves a model from the specified project.
     *
     * @param projectId - The ID of the project.
     * @param modelId - The ID of the model.
     * @param endpoint - (optional) The endpoint URL for the request. Default value is ":version/projects/:projectId/models/:modelId".
     * @returns A promise that resolves to a DeepgramResponse containing the GetModelResponse.
     * @example
     * ```typescript
     * import { createClient } from "@deepgram/sdk";
     *
     * const deepgram = createClient(DEEPGRAM_API_KEY);
     * const { result: model, error } = deepgram.models.getModel("projectId", "modelId");
     *
     * if (error) {
     *   console.error(error);
     * } else {
     *   console.log(model);
     * }
     * ```
     */
    getModel(projectId, modelId, endpoint = ":version/projects/:projectId/models/:modelId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, modelId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
}

//# sourceMappingURL=ManageRestClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/ModelsRestClient.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/ModelsRestClient.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ModelsRestClient: () => (/* binding */ ModelsRestClient)
/* harmony export */ });
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _AbstractRestClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


/**
 * Represents a REST client for interacting with the Deepgram API.
 *
 * The `ModelsRestClient` class provides methods for interacting with the Deepgram API to retrieve information about available models.
 * @extends AbstractRestClient
 */
class ModelsRestClient extends _AbstractRestClient__WEBPACK_IMPORTED_MODULE_1__.AbstractRestClient {
    constructor() {
        super(...arguments);
        this.namespace = "models";
    }
    /**
     * Retrieves a list of all available models.
     *
     * @param endpoint - (optional) The endpoint to request.
     * @returns A promise that resolves with the response from the Deepgram API.
     * @example
     * ```typescript
     * import { createClient } from "@deepgram/sdk";
     *
     * const deepgram = createClient(DEEPGRAM_API_KEY);
     * const { result: models, error } = deepgram.models.getAll();
     *
     * if (error) {
     *   console.error(error);
     * } else {
     *   console.log(models);
     * }
     * ```
     */
    getAll(endpoint = ":version/models", options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, {}, options);
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves information about a specific model.
     *
     * @param modelId - The UUID of the model to retrieve.
     * @param endpoint - (optional) The endpoint to request.
     * @returns A promise that resolves with the response from the Deepgram API.
     * @example
     * ```typescript
     * import { createClient } from "@deepgram/sdk";
     *
     * const deepgram = createClient(DEEPGRAM_API_KEY);
     * const { result: model, error } = deepgram.models.getModel("modelId");
     *
     * if (error) {
     *   console.error(error);
     * } else {
     *   console.log(model);
     * }
     * ```
     */
    getModel(modelId, endpoint = ":version/models/:modelId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { modelId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
}
//# sourceMappingURL=ModelsRestClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/ReadRestClient.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/ReadRestClient.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReadClient: () => (/* binding */ ReadRestClient),
/* harmony export */   ReadRestClient: () => (/* binding */ ReadRestClient)
/* harmony export */ });
/* harmony import */ var _lib_helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/helpers */ "./node_modules/@deepgram/sdk/dist/module/lib/helpers.js");
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _AbstractRestClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * The `ReadRestClient` class extends the `AbstractRestClient` class and provides methods for analyzing audio sources synchronously and asynchronously.
 *
 * The `analyzeUrl` method analyzes a URL-based audio source synchronously, returning a promise that resolves to the analysis response or an error.
 *
 * The `analyzeText` method analyzes a text-based audio source synchronously, returning a promise that resolves to the analysis response or an error.
 *
 * The `analyzeUrlCallback` method analyzes a URL-based audio source asynchronously, returning a promise that resolves to the analysis response or an error.
 *
 * The `analyzeTextCallback` method analyzes a text-based audio source asynchronously, returning a promise that resolves to the analysis response or an error.
 */
class ReadRestClient extends _AbstractRestClient__WEBPACK_IMPORTED_MODULE_2__.AbstractRestClient {
    constructor() {
        super(...arguments);
        this.namespace = "read";
    }
    /**
     * Analyzes a URL-based audio source synchronously.
     *
     * @param source - The URL-based audio source to analyze.
     * @param options - Optional analysis options.
     * @param endpoint - The API endpoint to use for the analysis. Defaults to ":version/read".
     * @returns A promise that resolves to the analysis response, or an error if the analysis fails.
     */
    analyzeUrl(source, options, endpoint = ":version/read") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body;
                if ((0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.isUrlSource)(source)) {
                    body = JSON.stringify(source);
                }
                else {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Unknown source type");
                }
                if (options !== undefined && "callback" in options) {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Callback cannot be provided as an option to a synchronous transcription. Use `analyzeUrlCallback` or `analyzeTextCallback` instead.");
                }
                const requestUrl = this.getRequestUrl(endpoint, {}, Object.assign({}, options));
                const result = yield this.post(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_1__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Analyzes a text-based audio source synchronously.
     *
     * @param source - The text-based audio source to analyze.
     * @param options - Optional analysis options.
     * @param endpoint - The API endpoint to use for the analysis. Defaults to ":version/read".
     * @returns A promise that resolves to the analysis response, or an error if the analysis fails.
     */
    analyzeText(source, options, endpoint = ":version/read") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body;
                if ((0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.isTextSource)(source)) {
                    body = JSON.stringify(source);
                }
                else {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Unknown source type");
                }
                if (options !== undefined && "callback" in options) {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Callback cannot be provided as an option to a synchronous requests. Use `analyzeUrlCallback` or `analyzeTextCallback` instead.");
                }
                const requestUrl = this.getRequestUrl(endpoint, {}, Object.assign({}, options));
                const result = yield this.post(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_1__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Analyzes a URL-based audio source asynchronously.
     *
     * @param source - The URL-based audio source to analyze.
     * @param callback - The URL to call back with the analysis results.
     * @param options - Optional analysis options.
     * @param endpoint - The API endpoint to use for the analysis. Defaults to ":version/read".
     * @returns A promise that resolves to the analysis response, or an error if the analysis fails.
     */
    analyzeUrlCallback(source, callback, options, endpoint = ":version/read") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body;
                if ((0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.isUrlSource)(source)) {
                    body = JSON.stringify(source);
                }
                else {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Unknown source type");
                }
                const requestUrl = this.getRequestUrl(endpoint, {}, Object.assign(Object.assign({}, options), { callback: callback.toString() }));
                const result = yield this.post(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_1__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Analyzes a text-based audio source asynchronously.
     *
     * @param source - The text-based audio source to analyze.
     * @param callback - The URL to call back with the analysis results.
     * @param options - Optional analysis options.
     * @param endpoint - The API endpoint to use for the analysis. Defaults to ":version/read".
     * @returns A promise that resolves to the analysis response, or an error if the analysis fails.
     */
    analyzeTextCallback(source, callback, options, endpoint = ":version/read") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body;
                if ((0,_lib_helpers__WEBPACK_IMPORTED_MODULE_0__.isTextSource)(source)) {
                    body = JSON.stringify(source);
                }
                else {
                    throw new _lib_errors__WEBPACK_IMPORTED_MODULE_1__.DeepgramError("Unknown source type");
                }
                const requestUrl = this.getRequestUrl(endpoint, {}, Object.assign(Object.assign({}, options), { callback: callback.toString() }));
                const result = yield this.post(requestUrl, body, {
                    headers: { "Content-Type": "deepgram/audio+video" },
                }).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_1__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
}

//# sourceMappingURL=ReadRestClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/SelfHostedRestClient.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/SelfHostedRestClient.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OnPremClient: () => (/* binding */ SelfHostedRestClient),
/* harmony export */   SelfHostedRestClient: () => (/* binding */ SelfHostedRestClient)
/* harmony export */ });
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _AbstractRestClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


/**
 * The `SelfHostedRestClient` class extends the `AbstractRestClient` class and provides methods for interacting with the Deepgram self-hosted API.
 *
 * This class is used to list, retrieve, create, and delete self-hosted credentials for a Deepgram project.
 */
class SelfHostedRestClient extends _AbstractRestClient__WEBPACK_IMPORTED_MODULE_1__.AbstractRestClient {
    constructor() {
        super(...arguments);
        this.namespace = "selfhosted";
    }
    /**
     * Lists the self-hosted credentials for a Deepgram project.
     *
     * @param projectId - The ID of the Deepgram project.
     * @returns A promise that resolves to an object containing the list of self-hosted credentials and any error that occurred.
     * @see https://developers.deepgram.com/reference/list-credentials
     */
    listCredentials(projectId, endpoint = ":version/projects/:projectId/onprem/distribution/credentials") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Retrieves the self-hosted credentials for a specific Deepgram project and credentials ID.
     *
     * @param projectId - The ID of the Deepgram project.
     * @param credentialsId - The ID of the self-hosted credentials to retrieve.
     * @returns A promise that resolves to an object containing the self-hosted credentials and any error that occurred.
     * @see https://developers.deepgram.com/reference/get-credentials
     */
    getCredentials(projectId, credentialsId, endpoint = ":version/projects/:projectId/onprem/distribution/credentials/:credentialsId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, credentialsId });
                const result = yield this.get(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Creates self-hosted credentials for a specific Deepgram project.
     *
     * @param projectId - The ID of the Deepgram project.
     * @param options - The options for creating the self-hosted credentials.
     * @returns A promise that resolves to an object containing the created self-hosted credentials and any error that occurred.
     * @see https://developers.deepgram.com/reference/create-credentials
     */
    createCredentials(projectId, options, endpoint = ":version/projects/:projectId/onprem/distribution/credentials") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId });
                const body = JSON.stringify(options);
                const result = yield this.post(requestUrl, body).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Deletes self-hosted credentials for a specific Deepgram project.
     *
     * @param projectId - The ID of the Deepgram project.
     * @param credentialsId - The ID of the self-hosted credentials to delete.
     * @returns A promise that resolves to an object containing a message response and any error that occurred.
     * @see https://developers.deepgram.com/reference/delete-credentials
     */
    deleteCredentials(projectId, credentialsId, endpoint = ":version/projects/:projectId/onprem/distribution/credentials/:credentialsId") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestUrl = this.getRequestUrl(endpoint, { projectId, credentialsId });
                const result = yield this.delete(requestUrl).then((result) => result.json());
                return { result, error: null };
            }
            catch (error) {
                if ((0,_lib_errors__WEBPACK_IMPORTED_MODULE_0__.isDeepgramError)(error)) {
                    return { result: null, error };
                }
                throw error;
            }
        });
    }
}

//# sourceMappingURL=SelfHostedRestClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/SpeakClient.js":
/*!************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/SpeakClient.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SpeakClient: () => (/* binding */ SpeakClient)
/* harmony export */ });
/* harmony import */ var _AbstractClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractClient.js");
/* harmony import */ var _SpeakLiveClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SpeakLiveClient */ "./node_modules/@deepgram/sdk/dist/module/packages/SpeakLiveClient.js");
/* harmony import */ var _SpeakRestClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SpeakRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/SpeakRestClient.js");



/**
 * The `SpeakClient` class extends the `AbstractClient` class and provides access to the "speak" namespace.
 * It exposes two methods:
 *
 * 1. `request()`: Returns a `SpeakRestClient` instance for interacting with the rest speak API.
 * 2. `live(ttsOptions: SpeakSchema = {}, endpoint = ":version/speak")`: Returns a `SpeakLiveClient` instance for interacting with the live speak API, with the provided TTS options and endpoint.
 */
class SpeakClient extends _AbstractClient__WEBPACK_IMPORTED_MODULE_0__.AbstractClient {
    constructor() {
        super(...arguments);
        this.namespace = "speak";
    }
    /**
     * Returns a `SpeakRestClient` instance for interacting with the rest speak API.
     */
    request(source, options, endpoint = ":version/speak") {
        const client = new _SpeakRestClient__WEBPACK_IMPORTED_MODULE_2__.SpeakRestClient(this.options);
        return client.request(source, options, endpoint);
    }
    /**
     * Returns a `SpeakLiveClient` instance for interacting with the live speak API, with the provided TTS options and endpoint.
     * @param {SpeakSchema} [ttsOptions={}] - The TTS options to use for the live speak API.
     * @param {string} [endpoint=":version/speak"] - The endpoint to use for the live speak API.
     * @returns {SpeakLiveClient} - A `SpeakLiveClient` instance for interacting with the live speak API.
     */
    live(ttsOptions = {}, endpoint = ":version/speak") {
        return new _SpeakLiveClient__WEBPACK_IMPORTED_MODULE_1__.SpeakLiveClient(this.options, ttsOptions, endpoint);
    }
}
//# sourceMappingURL=SpeakClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/SpeakLiveClient.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/SpeakLiveClient.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SpeakLiveClient: () => (/* binding */ SpeakLiveClient)
/* harmony export */ });
/* harmony import */ var _AbstractLiveClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractLiveClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractLiveClient.js");
/* harmony import */ var _lib_enums__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/enums */ "./node_modules/@deepgram/sdk/dist/module/lib/enums/LiveTTSEvents.js");


/**
 * The `SpeakLiveClient` class extends the `AbstractLiveClient` class and provides functionality for setting up and managing a WebSocket connection for live text-to-speech synthesis.
 *
 * The constructor takes in `DeepgramClientOptions` and an optional `SpeakSchema` object, as well as an optional `endpoint` string. It then calls the `connect` method of the parent `AbstractLiveClient` class to establish the WebSocket connection.
 *
 * The `setupConnection` method is responsible for handling the various events that can occur on the WebSocket connection, such as opening, closing, and receiving messages. It sets up event handlers for these events and emits the appropriate events based on the message type.
 *
 * The `configure` method allows you to send additional configuration options to the connected session.
 *
 * The `requestClose` method requests the server to close the connection.
 */
class SpeakLiveClient extends _AbstractLiveClient__WEBPACK_IMPORTED_MODULE_0__.AbstractLiveClient {
    /**
     * Constructs a new `SpeakLiveClient` instance with the provided options.
     *
     * @param options - The `DeepgramClientOptions` to use for the client connection.
     * @param speakOptions - An optional `SpeakSchema` object containing additional configuration options for the text-to-speech.
     * @param endpoint - An optional string representing the WebSocket endpoint to connect to. Defaults to `:version/speak`.
     */
    constructor(options, speakOptions = {}, endpoint = ":version/speak") {
        super(options);
        this.namespace = "speak";
        this.connect(speakOptions, endpoint);
    }
    /**
     * Sets up the connection event handlers.
     * This method is responsible for handling the various events that can occur on the WebSocket connection, such as opening, closing, and receiving data.
     * - When the connection is opened, it emits the `LiveTTSEvents.Open` event.
     * - When the connection is closed, it emits the `LiveTTSEvents.Close` event.
     * - When an error occurs on the connection, it emits the `LiveTTSEvents.Error` event.
     * - When a message is received, it parses the message and emits the appropriate event based on the message type, such as `LiveTTSEvents.Metadata`, `LiveTTSEvents.Flushed`, and `LiveTTSEvents.Warning`.
     */
    setupConnection() {
        if (this.conn) {
            this.conn.onopen = () => {
                this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Open, this);
            };
            this.conn.onclose = (event) => {
                this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Close, event);
            };
            this.conn.onerror = (event) => {
                this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Error, event);
            };
            this.conn.onmessage = (event) => {
                this.handleMessage(event);
            };
        }
    }
    /**
     * Handles text messages received from the WebSocket connection.
     * @param data - The parsed JSON data.
     */
    handleTextMessage(data) {
        if (data.type === _lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Metadata) {
            this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Metadata, data);
        }
        else if (data.type === _lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Flushed) {
            this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Flushed, data);
        }
        else if (data.type === _lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Warning) {
            this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Warning, data);
        }
        else {
            this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Unhandled, data);
        }
    }
    /**
     * Handles binary messages received from the WebSocket connection.
     * @param data - The binary data.
     */
    handleBinaryMessage(data) {
        this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Audio, data);
    }
    /**
     * Sends a text input message to the server.
     *
     * @param {string} text - The text to convert to speech.
     */
    sendText(text) {
        this.send(JSON.stringify({
            type: "Speak",
            text,
        }));
    }
    /**
     * Requests the server flush the current buffer and return generated audio.
     */
    flush() {
        this.send(JSON.stringify({
            type: "Flush",
        }));
    }
    /**
     * Requests the server clear the current buffer.
     */
    clear() {
        this.send(JSON.stringify({
            type: "Clear",
        }));
    }
    /**
     * Requests the server close the connection.
     */
    requestClose() {
        this.send(JSON.stringify({
            type: "Close",
        }));
    }
    /**
     * Handles incoming messages from the WebSocket connection.
     * @param event - The MessageEvent object representing the received message.
     */
    handleMessage(event) {
        if (typeof event.data === "string") {
            try {
                const data = JSON.parse(event.data);
                this.handleTextMessage(data);
            }
            catch (error) {
                this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Error, {
                    event,
                    message: "Unable to parse `data` as JSON.",
                    error,
                });
            }
        }
        else if (event.data instanceof Blob) {
            event.data.arrayBuffer().then((buffer) => {
                this.handleBinaryMessage(Buffer.from(buffer));
            });
        }
        else if (event.data instanceof ArrayBuffer) {
            this.handleBinaryMessage(Buffer.from(event.data));
        }
        else if (Buffer.isBuffer(event.data)) {
            this.handleBinaryMessage(event.data);
        }
        else {
            console.log("Received unknown data type", event.data);
            this.emit(_lib_enums__WEBPACK_IMPORTED_MODULE_1__.LiveTTSEvents.Error, {
                event,
                message: "Received unknown data type.",
            });
        }
    }
}
//# sourceMappingURL=SpeakLiveClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/SpeakRestClient.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/SpeakRestClient.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SpeakRestClient: () => (/* binding */ SpeakRestClient)
/* harmony export */ });
/* harmony import */ var _lib_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/errors */ "./node_modules/@deepgram/sdk/dist/module/lib/errors.js");
/* harmony import */ var _lib_helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/helpers */ "./node_modules/@deepgram/sdk/dist/module/lib/helpers.js");
/* harmony import */ var _AbstractRestClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * Provides a client for interacting with the Deepgram Text-to-Speech API.
 */
class SpeakRestClient extends _AbstractRestClient__WEBPACK_IMPORTED_MODULE_2__.AbstractRestClient {
    constructor() {
        super(...arguments);
        this.namespace = "speak";
    }
    /**
     * Sends a request to the Deepgram Text-to-Speech API to generate audio from the provided text source.
     *
     * @param source - The text source to be converted to audio.
     * @param options - Optional configuration options for the text-to-speech request.
     * @param endpoint - The API endpoint to use for the request. Defaults to ":version/speak".
     * @returns A promise that resolves to the SpeakRestClient instance, which can be used to retrieve the response headers and body.
     * @throws {DeepgramError} If the text source type is unknown.
     * @throws {DeepgramUnknownError} If the request was made before a previous request completed.
     * @see https://developers.deepgram.com/reference/text-to-speech-api
     */
    request(source, options, endpoint = ":version/speak") {
        return __awaiter(this, void 0, void 0, function* () {
            let body;
            if ((0,_lib_helpers__WEBPACK_IMPORTED_MODULE_1__.isTextSource)(source)) {
                body = JSON.stringify(source);
            }
            else {
                throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramError("Unknown transcription source type");
            }
            const requestUrl = this.getRequestUrl(endpoint, {}, Object.assign({ model: "aura-asteria-en" }, options));
            this.result = yield this.post(requestUrl, body, {
                headers: { Accept: "audio/*", "Content-Type": "application/json" },
            });
            return this;
        });
    }
    /**
     * Retrieves the response body as a readable stream.
     *
     * @returns A promise that resolves to the response body as a readable stream, or `null` if no request has been made yet.
     * @throws {DeepgramUnknownError} If a request has not been made yet.
     */
    getStream() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.result)
                throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramUnknownError("Tried to get stream before making request", "");
            return this.result.body;
        });
    }
    /**
     * Retrieves the response headers from the previous request.
     *
     * @returns A promise that resolves to the response headers, or throws a `DeepgramUnknownError` if no request has been made yet.
     */
    getHeaders() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.result)
                throw new _lib_errors__WEBPACK_IMPORTED_MODULE_0__.DeepgramUnknownError("Tried to get headers before making request", "");
            return this.result.headers;
        });
    }
}
//# sourceMappingURL=SpeakRestClient.js.map

/***/ }),

/***/ "./node_modules/@deepgram/sdk/dist/module/packages/index.js":
/*!******************************************************************!*\
  !*** ./node_modules/@deepgram/sdk/dist/module/packages/index.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractClient: () => (/* reexport safe */ _AbstractClient__WEBPACK_IMPORTED_MODULE_0__.AbstractClient),
/* harmony export */   AbstractLiveClient: () => (/* reexport safe */ _AbstractLiveClient__WEBPACK_IMPORTED_MODULE_1__.AbstractLiveClient),
/* harmony export */   AbstractRestClient: () => (/* reexport safe */ _AbstractRestClient__WEBPACK_IMPORTED_MODULE_2__.AbstractRestClient),
/* harmony export */   AbstractRestfulClient: () => (/* reexport safe */ _AbstractRestClient__WEBPACK_IMPORTED_MODULE_2__.AbstractRestfulClient),
/* harmony export */   AbstractWsClient: () => (/* reexport safe */ _AbstractLiveClient__WEBPACK_IMPORTED_MODULE_1__.AbstractWsClient),
/* harmony export */   AgentLiveClient: () => (/* reexport safe */ _AgentLiveClient__WEBPACK_IMPORTED_MODULE_3__.AgentLiveClient),
/* harmony export */   AuthRestClient: () => (/* reexport safe */ _AuthRestClient__WEBPACK_IMPORTED_MODULE_4__.AuthRestClient),
/* harmony export */   ListenClient: () => (/* reexport safe */ _ListenClient__WEBPACK_IMPORTED_MODULE_5__.ListenClient),
/* harmony export */   ListenLiveClient: () => (/* reexport safe */ _ListenLiveClient__WEBPACK_IMPORTED_MODULE_6__.ListenLiveClient),
/* harmony export */   ListenRestClient: () => (/* reexport safe */ _ListenRestClient__WEBPACK_IMPORTED_MODULE_7__.ListenRestClient),
/* harmony export */   LiveClient: () => (/* reexport safe */ _ListenLiveClient__WEBPACK_IMPORTED_MODULE_6__.LiveClient),
/* harmony export */   ManageClient: () => (/* reexport safe */ _ManageRestClient__WEBPACK_IMPORTED_MODULE_8__.ManageClient),
/* harmony export */   ManageRestClient: () => (/* reexport safe */ _ManageRestClient__WEBPACK_IMPORTED_MODULE_8__.ManageRestClient),
/* harmony export */   ModelsRestClient: () => (/* reexport safe */ _ModelsRestClient__WEBPACK_IMPORTED_MODULE_9__.ModelsRestClient),
/* harmony export */   OnPremClient: () => (/* reexport safe */ _SelfHostedRestClient__WEBPACK_IMPORTED_MODULE_11__.OnPremClient),
/* harmony export */   PrerecordedClient: () => (/* reexport safe */ _ListenRestClient__WEBPACK_IMPORTED_MODULE_7__.PrerecordedClient),
/* harmony export */   ReadClient: () => (/* reexport safe */ _ReadRestClient__WEBPACK_IMPORTED_MODULE_10__.ReadClient),
/* harmony export */   ReadRestClient: () => (/* reexport safe */ _ReadRestClient__WEBPACK_IMPORTED_MODULE_10__.ReadRestClient),
/* harmony export */   SelfHostedRestClient: () => (/* reexport safe */ _SelfHostedRestClient__WEBPACK_IMPORTED_MODULE_11__.SelfHostedRestClient),
/* harmony export */   SpeakClient: () => (/* reexport safe */ _SpeakClient__WEBPACK_IMPORTED_MODULE_12__.SpeakClient),
/* harmony export */   SpeakLiveClient: () => (/* reexport safe */ _SpeakLiveClient__WEBPACK_IMPORTED_MODULE_13__.SpeakLiveClient),
/* harmony export */   SpeakRestClient: () => (/* reexport safe */ _SpeakRestClient__WEBPACK_IMPORTED_MODULE_14__.SpeakRestClient),
/* harmony export */   noop: () => (/* reexport safe */ _AbstractClient__WEBPACK_IMPORTED_MODULE_0__.noop)
/* harmony export */ });
/* harmony import */ var _AbstractClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractClient.js");
/* harmony import */ var _AbstractLiveClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractLiveClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractLiveClient.js");
/* harmony import */ var _AbstractRestClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AbstractRestClient.js");
/* harmony import */ var _AgentLiveClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AgentLiveClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AgentLiveClient.js");
/* harmony import */ var _AuthRestClient__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./AuthRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/AuthRestClient.js");
/* harmony import */ var _ListenClient__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ListenClient */ "./node_modules/@deepgram/sdk/dist/module/packages/ListenClient.js");
/* harmony import */ var _ListenLiveClient__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ListenLiveClient */ "./node_modules/@deepgram/sdk/dist/module/packages/ListenLiveClient.js");
/* harmony import */ var _ListenRestClient__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ListenRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/ListenRestClient.js");
/* harmony import */ var _ManageRestClient__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ManageRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/ManageRestClient.js");
/* harmony import */ var _ModelsRestClient__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ModelsRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/ModelsRestClient.js");
/* harmony import */ var _ReadRestClient__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ReadRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/ReadRestClient.js");
/* harmony import */ var _SelfHostedRestClient__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./SelfHostedRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/SelfHostedRestClient.js");
/* harmony import */ var _SpeakClient__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./SpeakClient */ "./node_modules/@deepgram/sdk/dist/module/packages/SpeakClient.js");
/* harmony import */ var _SpeakLiveClient__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./SpeakLiveClient */ "./node_modules/@deepgram/sdk/dist/module/packages/SpeakLiveClient.js");
/* harmony import */ var _SpeakRestClient__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./SpeakRestClient */ "./node_modules/@deepgram/sdk/dist/module/packages/SpeakRestClient.js");















//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@googleworkspace/meet-addons/meet.addons.mjs":
/*!*******************************************************************!*\
  !*** ./node_modules/@googleworkspace/meet-addons/meet.addons.mjs ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   meet: () => (/* binding */ meet)
/* harmony export */ });
const topLevel = typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self  : typeof window !== 'undefined' ? window  : {};(function() {'use strict';var aa=Object.defineProperty;function ba(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}var ca=ba(this);
function da(a,b){if(b)a:{var c=ca;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&b!=null&&aa(c,a,{configurable:!0,writable:!0,value:b})}}da("Symbol.dispose",function(a){return a?a:Symbol("Symbol.dispose")});/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var l=this||self;function ea(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}function fa(a,b){function c(){}c.prototype=b.prototype;a.qa=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.oa=function(d,e,f){for(var g=Array(arguments.length-2),k=2;k<arguments.length;k++)g[k-2]=arguments[k];return b.prototype[e].apply(d,g)}};function ha(a,b){if(Error.captureStackTrace)Error.captureStackTrace(this,ha);else{const c=Error().stack;c&&(this.stack=c)}a&&(this.message=String(a));b!==void 0&&(this.cause=b)}fa(ha,Error);ha.prototype.name="CustomError";function m(a){l.setTimeout(()=>{throw a;},0)};var ia,ja;a:{for(var ka=["CLOSURE_FLAGS"],la=l,ma=0;ma<ka.length;ma++)if(la=la[ka[ma]],la==null){ja=null;break a}ja=la}var na=ja&&ja[610401301];ia=na!=null?na:!1;var oa;const pa=l.navigator;oa=pa?pa.userAgentData||null:null;function qa(a){return ia?oa?oa.brands.some(({brand:b})=>b&&b.indexOf(a)!=-1):!1:!1}function n(a){var b;a:{if(b=l.navigator)if(b=b.userAgent)break a;b=""}return b.indexOf(a)!=-1};function p(){return ia?!!oa&&oa.brands.length>0:!1}function ra(){return p()?qa("Chromium"):(n("Chrome")||n("CriOS"))&&!(p()?0:n("Edge"))||n("Silk")};function sa(a,b){b=Array.prototype.indexOf.call(a,b,void 0);b>=0&&Array.prototype.splice.call(a,b,1)};!n("Android")||ra();ra();n("Safari")&&(ra()||(p()?0:n("Coast"))||(p()?0:n("Opera"))||(p()?0:n("Edge"))||(p()?qa("Microsoft Edge"):n("Edg/"))||p()&&qa("Opera"));function ta(a){let b="",c=0;const d=a.length-10240;for(;c<d;)b+=String.fromCharCode.apply(null,a.subarray(c,c+=10240));b+=String.fromCharCode.apply(null,c?a.subarray(c):a);return btoa(b)}const ua=/[-_.]/g,va={"-":"+",_:"/",".":"="};function wa(a){return va[a]||""}function xa(a){return a!=null&&a instanceof Uint8Array}var ya={};function za(){return Aa||(Aa=new Ba(null,ya))}var Ba=class{constructor(a,b){Ca(b);this.g=a;if(a!=null&&a.length===0)throw Error("ByteString should be constructed with non-empty values");}};let Aa;function Ca(a){if(a!==ya)throw Error("illegal external caller");};function Da(a,b){a.__closure__error__context__984382||(a.__closure__error__context__984382={});a.__closure__error__context__984382.severity=b};let Ea;function Fa(){const a=Error();Da(a,"incident");m(a)}function Ga(a){a=Error(a);Da(a,"warning");return a};function Ha(){return typeof BigInt==="function"};function Ia(a){return Array.prototype.slice.call(a)};function q(a,b){return b&&Symbol.for&&a?Symbol.for(a):a!=null?Symbol(a):Symbol()}var r=q("jas",!0);q();var La=q(),Ma=q();q();q();function Na(a,b){b[r]=(a|0)&-30975}function Oa(a,b){b[r]=(a|34)&-30941};var Pa={},Qa={};function Ra(a){return!(!a||typeof a!=="object"||a.g!==Qa)}function Sa(a){return a!==null&&typeof a==="object"&&!Array.isArray(a)&&a.constructor===Object}function Ta(a,b){if(a!=null)if(typeof a==="string")a=a?new Ba(a,ya):za();else if(a.constructor!==Ba)if(xa(a))a=a.length?new Ba(new Uint8Array(a),ya):za();else{if(!b)throw Error();a=void 0}return a}function Ua(a){return!Array.isArray(a)||a.length?!1:(a[r]|0)&1?!0:!1}var Va;const Wa=[];Wa[r]=55;Va=Object.freeze(Wa);
function Xa(a){if(a&2)throw Error();}var Ya=Object.freeze({});function Za(a){a.pa=!0;return a};var $a=Za(a=>typeof a==="number"),ab=Za(a=>typeof a==="string"),bb=Za(a=>typeof a==="boolean");var cb=typeof l.BigInt==="function"&&typeof l.BigInt(0)==="bigint";var ib=Za(a=>cb?a>=db&&a<=eb:a[0]==="-"?fb(a,gb):fb(a,hb));const gb=Number.MIN_SAFE_INTEGER.toString(),db=cb?BigInt(Number.MIN_SAFE_INTEGER):void 0,hb=Number.MAX_SAFE_INTEGER.toString(),eb=cb?BigInt(Number.MAX_SAFE_INTEGER):void 0;function fb(a,b){if(a.length>b.length)return!1;if(a.length<b.length||a===b)return!0;for(let c=0;c<a.length;c++){const d=a[c],e=b[c];if(d>e)return!1;if(d<e)return!0}};let u=0,w=0;function jb(a){const b=a>>>0;u=b;w=(a-b)/4294967296>>>0}function kb(a){if(a<0){jb(-a);const [b,c]=lb(u,w);u=b>>>0;w=c>>>0}else jb(a)}function mb(a,b){b>>>=0;a>>>=0;if(b<=2097151)var c=""+(4294967296*b+a);else Ha()?c=""+(BigInt(b)<<BigInt(32)|BigInt(a)):(c=(a>>>24|b<<8)&16777215,b=b>>16&65535,a=(a&16777215)+c*6777216+b*6710656,c+=b*8147497,b*=2,a>=1E7&&(c+=a/1E7>>>0,a%=1E7),c>=1E7&&(b+=c/1E7>>>0,c%=1E7),c=b+nb(c)+nb(a));return c}
function nb(a){a=String(a);return"0000000".slice(a.length)+a}function lb(a,b){b=~b;a?a=~a+1:b+=1;return[a,b]};function ob(a){if(a==null||typeof a==="boolean")return a;if(typeof a==="number")return!!a}const pb=/^-?([1-9][0-9]*|0)(\.[0-9]+)?$/;function qb(a){const b=typeof a;switch(b){case "bigint":return!0;case "number":return Number.isFinite(a)}return b!=="string"?!1:pb.test(a)}function y(a){if(a!=null){if(!Number.isFinite(a))throw Ga("enum");a|=0}return a}function rb(a){if(a!=null){if(typeof a==="string"){if(!a)return;a=+a}typeof a==="number"&&Number.isFinite(a)}}
function sb(a){if(a!=null)a:{if(!qb(a))throw Ga("int64");switch(typeof a){case "string":a=xb(a);break a;case "bigint":var b=a=BigInt.asIntN(64,a);if(ab(b)){if(!/^\s*(?:-?[1-9]\d*|0)?\s*$/.test(b))throw Error(String(b));}else if($a(b)&&!Number.isSafeInteger(b))throw Error(String(b));cb?a=BigInt(a):a=bb(a)?a?"1":"0":ab(a)?a.trim()||"0":String(a);break a;default:a=yb(a)}}return a}
function yb(a){a=Math.trunc(a);if(!Number.isSafeInteger(a)){kb(a);var b=u,c=w;if(a=c&2147483648)b=~b+1>>>0,c=~c>>>0,b==0&&(c=c+1>>>0);const d=c*4294967296+(b>>>0);b=Number.isSafeInteger(d)?d:mb(b,c);a=typeof b==="number"?a?-b:b:a?"-"+b:b}return a}
function xb(a){var b=Math.trunc(Number(a));if(Number.isSafeInteger(b))return String(b);b=a.indexOf(".");b!==-1&&(a=a.substring(0,b));if(!(a[0]==="-"?a.length<20||a.length===20&&Number(a.substring(0,7))>-922337:a.length<19||a.length===19&&Number(a.substring(0,6))<922337)){if(a.length<16)kb(Number(a));else if(Ha())a=BigInt(a),u=Number(a&BigInt(4294967295))>>>0,w=Number(a>>BigInt(32)&BigInt(4294967295));else{b=+(a[0]==="-");w=u=0;const c=a.length;for(let d=b,e=(c-b)%6+b;e<=c;d=e,e+=6){const f=Number(a.slice(d,
e));w*=1E6;u=u*1E6+f;u>=4294967296&&(w+=Math.trunc(u/4294967296),w>>>=0,u>>>=0)}if(b){const [d,e]=lb(u,w);u=d;w=e}}a=u;b=w;if(b&2147483648)if(Ha())a=""+(BigInt(b|0)<<BigInt(32)|BigInt(a>>>0));else{const [c,d]=lb(a,b);a="-"+mb(c,d)}else a=mb(a,b)}return a}function z(a){if(a!=null&&typeof a!=="string")throw Error();return a}function zb(a,b,c){if(a!=null&&typeof a==="object"&&a.H===Pa)return a;if(Array.isArray(a)){var d=a[r]|0,e=d;e===0&&(e|=c&32);e|=c&2;e!==d&&(a[r]=e);return new b(a)}};function Ab(a){Bb===void 0&&(Bb=typeof Proxy==="function"?Cb(Proxy):null);var b;(b=!Bb)||(Db===void 0&&(Db=typeof WeakMap==="function"?Cb(WeakMap):null),b=!Db);if(b)return a;if(b=Eb(a))return b;if(Math.random()>.01)return a;Fb(a);b=new Bb(a,{set(c,d,e){Gb();c[d]=e;return!0}});Hb(a,b);return b}function Gb(){Fa()}let Ib=void 0,Jb=void 0;function Eb(a){let b;return(b=Ib)==null?void 0:b.get(a)}function Hb(a,b){(Ib||(Ib=new Db)).set(a,b);(Jb||(Jb=new Db)).set(b,a)}let Bb=void 0,Db=void 0;
function Cb(a){try{return a.toString().indexOf("[native code]")!==-1?a:null}catch{return null}}let Kb=void 0;function Fb(a){if(Kb===void 0){const b=new Bb([],{});Kb=Array.prototype.concat.call([],b).length===1}Kb&&typeof Symbol==="function"&&Symbol.isConcatSpreadable&&(a[Symbol.isConcatSpreadable]=!0)};function Lb(a,b){return Mb(b)}function Mb(a){switch(typeof a){case "number":return isFinite(a)?a:String(a);case "bigint":return ib(a)?Number(a):String(a);case "boolean":return a?1:0;case "object":if(a)if(Array.isArray(a)){if(Ua(a))return}else{if(xa(a))return ta(a);if(a instanceof Ba){const b=a.g;return b==null?"":typeof b==="string"?b:a.g=ta(b)}}}return a};function Nb(a,b,c){a=Ia(a);var d=a.length;const e=b&256?a[d-1]:void 0;d+=e?-1:0;for(b=b&512?1:0;b<d;b++)a[b]=c(a[b]);if(e){b=a[b]={};for(const f in e)b[f]=c(e[f])}return a}function Ob(a,b,c,d,e){if(a!=null){if(Array.isArray(a))a=Ua(a)?void 0:e&&(a[r]|0)&2?a:Pb(a,b,c,d!==void 0,e);else if(Sa(a)){const f={};for(let g in a)f[g]=Ob(a[g],b,c,d,e);a=f}else a=b(a,d);return a}}
function Pb(a,b,c,d,e){const f=d||c?a[r]|0:0;d=d?!!(f&32):void 0;a=Ia(a);for(let g=0;g<a.length;g++)a[g]=Ob(a[g],b,c,d,e);c&&c(f,a);return a}function Qb(a){return a.H===Pa?a.toJSON():Mb(a)};function Rb(a,b,c=Oa){if(a!=null){if(a instanceof Uint8Array)return b?a:new Uint8Array(a);if(Array.isArray(a)){var d=a[r]|0;if(d&2)return a;b&&(b=d===0||!!(d&32)&&!(d&64||!(d&16)));return b?(a[r]=(d|34)&-12293,a):Pb(a,Rb,d&4?Oa:c,!0,!0)}a.H===Pa&&(c=a.m,d=c[r],a=d&2?a:new a.constructor(Sb(c,d,!0)));return a}}function Sb(a,b,c){const d=c||b&2?Oa:Na,e=!!(b&32);a=Nb(a,b,f=>Rb(f,e,d));a[r]=a[r]|32|(c?2:0);return a}function Tb(a){const b=a.m,c=b[r];return c&2?new a.constructor(Sb(b,c,!1)):a};function A(a,b){a=a.m;return B(a,a[r],b)}function Ub(a,b,c,d){b=d+(+!!(b&512)-1);if(!(b<0||b>=a.length||b>=c))return a[b]}function B(a,b,c,d){if(c===-1)return null;const e=b>>15&1023||536870912;if(c>=e){if(b&256)return a[a.length-1][c]}else{var f=a.length;if(d&&b&256&&(d=a[f-1][c],d!=null)){if(Ub(a,b,e,c)&&La!=null){var g;a=(g=Ea)!=null?g:Ea={};g=a[La]||0;g>=4||(a[La]=g+1,Fa())}return d}return Ub(a,b,e,c)}}function Vb(a,b,c){const d=a.m;let e=d[r];Xa(e);C(d,e,b,c);return a}
function C(a,b,c,d){const e=b>>15&1023||536870912;if(c>=e){let f,g=b;if(b&256)f=a[a.length-1];else{if(d==null)return g;f=a[e+(+!!(b&512)-1)]={};g|=256}f[c]=d;c<e&&(a[c+(+!!(b&512)-1)]=void 0);g!==b&&(a[r]=g);return g}a[c+(+!!(b&512)-1)]=d;b&256&&(a=a[a.length-1],c in a&&delete a[c]);return b}function D(a,b,c,d){c=E(a,d)===c?c:-1;return Wb(a,b,c)!==void 0}function Xb(a){return!!(2&a)&&!!(4&a)||!!(2048&a)}
function F(a,b,c,d){const e=a.m;let f=e[r];Xa(f);C(e,f,b,(d==="0"?Number(c)===0:c===d)?void 0:c);return a}function E(a,b){a=a.m;return Yb(Zb(a),a,a[r],b)}function Zb(a){let b;return(b=a[Ma])!=null?b:a[Ma]=new Map}function Yb(a,b,c,d){let e=a.get(d);if(e!=null)return e;e=0;for(let f=0;f<d.length;f++){const g=d[f];B(b,c,g)!=null&&(e!==0&&(c=C(b,c,e)),e=g)}a.set(d,e);return e}function Wb(a,b,c,d){a=a.m;let e=a[r];d=B(a,e,c,d);b=zb(d,b,e);b!==d&&b!=null&&C(a,e,c,b);return b}
function $b(a,b,c){b=Wb(a,b,c,!1);if(b==null)return b;a=a.m;let d=a[r];if(!(d&2)){const e=Tb(b);e!==b&&(b=e,C(a,d,c,b))}return b}function ac(a,b,c){c==null&&(c=void 0);return Vb(a,b,c)}function G(a,b,c,d){d==null&&(d=void 0);a:{const g=a.m;var e=g[r];Xa(e);if(d==null){var f=Zb(g);if(Yb(f,g,e,c)===b)f.set(c,0);else break a}else{f=g;const k=Zb(f),h=Yb(k,f,e,c);h!==b&&(h&&(e=C(f,e,h)),k.set(c,b))}C(g,e,b,d)}return a}
function bc(a,b){const c=a.m;let d=c[r];Xa(d);if(b==null)return C(c,d,1),a;var e=b,f;b=((f=Jb)==null?void 0:f.get(e))||e;f=e=b[r]|0;const g=Xb(e),k=g||Object.isFrozen(b);let h=!0,t=!0;for(let x=0;x<b.length;x++){var v=b[x];g||(v=!!((v.m[r]|0)&2),h&&(h=!v),t&&(t=v))}g||(e=h?13:5,e=t?e|16:e&-17);k&&e===f||(b=Ia(b),f=0,e=cc(e,d),e=dc(e,d,!0));e!==f&&(b[r]=e);C(c,d,1,b);return a}function cc(a,b){a=(2&b?a|2:a&-3)|32;return a&=-2049}function dc(a,b,c){32&b&&c||(a&=-33);return a}
function ec(a,b){return a!=null?a:b}function fc(a){a=A(a,1);a!=null&&(typeof a==="bigint"?ib(a)?a=Number(a):(a=BigInt.asIntN(64,a),a=ib(a)?Number(a):String(a)):a=qb(a)?typeof a==="number"?yb(a):xb(a):void 0);return ec(a,0)}function H(a,b){a=A(a,b);return ec(a==null||typeof a==="string"?a:void 0,"")}function I(a,b){a=A(a,b);a=a==null?a:Number.isFinite(a)?a|0:void 0;return ec(a,0)}function J(a,b,c,d){c=E(a,d)===c?c:-1;return $b(a,b,c)};let gc;function hc(a){try{return gc=!0,JSON.stringify(ic(a),Lb)}finally{gc=!1}}function jc(){var a=kc||(kc=lc("[1,2,0]"));a=Tb(a);a=Vb(a,4,z("dev-706864954"));const b=a.m,c=b[r];return c&2?a:new a.constructor(Sb(b,c,!0))}
var K=class{constructor(a){a:{var b=b!=null?b:0;if(a==null){var c=96;a=[]}else{if(!Array.isArray(a))throw Error("narr");c=a[r]|0;if(c&2048)throw Error("farr");if(c&64)break a;b===1||b===2||(c|=64);b=a;var d=b.length;if(d&&(--d,Sa(b[d]))){c|=256;b=d-(+!!(c&512)-1);if(b>=1024)throw Error("pvtlmt");c=c&-33521665|(b&1023)<<15}}a[r]=c}this.m=a}toJSON(){return ic(this)}};K.prototype.H=Pa;K.prototype.toString=function(){try{return gc=!0,ic(this).toString()}finally{gc=!1}};
function ic(a){a=a.m;a=gc?a:Pb(a,Qb,void 0,void 0,!1);{var b=!gc;let t=a.length;if(t){var c=a[t-1],d=Sa(c);d?t--:c=void 0;var e=a;if(d){b:{var f=c;var g;var k=!1;if(f)for(let v in f)if(isNaN(+v)){let x;((x=g)!=null?x:g={})[v]=f[v]}else if(d=f[v],Array.isArray(d)&&(Ua(d)||Ra(d)&&d.size===0)&&(d=null),d==null&&(k=!0),d!=null){let x;((x=g)!=null?x:g={})[v]=d}k||(g=f);if(g)for(let v in g){k=g;break b}k=null}f=k==null?c!=null:k!==c}for(;t>0;t--){g=e[t-1];if(!(g==null||Ua(g)||Ra(g)&&g.size===0))break;var h=
!0}if(e!==a||f||h){if(!b)e=Array.prototype.slice.call(e,0,t);else if(h||f||k)e.length=t;k&&e.push(k)}h=e}else h=a}return h};function mc(a){return b=>{if(b==null||b=="")b=new a;else{b=JSON.parse(b);if(!Array.isArray(b))throw Error("dnarr");b[r]|=32;b=new a(b)}return b}};var lc=function(a){return b=>{b=JSON.parse(b);if(!Array.isArray(b)){var c=typeof b;throw Error("Expected jspb data to be an array, got "+(c!="object"?c:b?Array.isArray(b)?"array":c:"null")+": "+b);}b[r]|=34;return new a(b)}}(class extends K{});var nc=class extends K{};function oc(a){var b=new pc(500);let c=0,d;return(...e)=>{qc(b)?a(...e):(d=()=>void a(...e),c||(c=setTimeout(()=>{c=0;let f;(f=d)==null||f()},rc(b))))}}function sc(a){var b=new pc(100),c=Promise.resolve();return(...d)=>qc(b)?a(...d):c};function qc(a){return tc(a,a.index)>=a.g?(a.h[a.index]=Date.now(),a.index=(a.index+1)%1,!0):!1}function rc(a){const b=a.g;a=tc(a,a.index);return a>=b?0:b-a}function tc(a,b){let c;return Date.now()-((c=a.h[b])!=null?c:-1*a.g)}var pc=class{constructor(a){this.g=a;this.h=[];this.index=0}};var uc=class extends K{},vc=[2,3];var wc=class extends K{};var L=class extends Error{constructor({errorType:a,message:b,i:c}){super(`Meet Add-on SDK error: ${`${b}${c?` - ${c}`:""}`}`);this.errorType=a}},M={errorType:"InternalError",message:"An unexpected error has occurred.",i:"No further information is available."},xc={errorType:"MissingUrlParameter",message:"Missing required Meet SDK URL parameter",i:"This parameter is automatically appended by Meet to the iframe URL. Ensure that your infrastructure does not strip URL parameters (e.g. as part of a redirect)."},
yc={errorType:"NeedsMainStageContext",message:"This method can only be invoked if the addon is running in the main stage.",i:"Use getFrameType to check whether the addon is running in the main stage before invoking this method."},zc={errorType:"NeedsSidePanelContext",message:"This method can only be invoked if the addon is running in the side panel.",i:"Use getFrameType to check whether the addon is running in the side panel before invoking this method."},Ac={errorType:"NotSupportedInStandalone",
message:"This method is not supported in standalone mode.",i:"Do not call this method in standalone mode."},Bc={errorType:"InternalError",message:"The frame type URL parameter is set to an unexpected value.",i:"This parameter is automatically appended by Meet to the iframe URL. Ensure that your infrastructure does not modify URL parameters (e.g. as part of a redirect)."},Cc={errorType:"InvalidCloudProjectNumber",message:"Cloud Project Number provided by meet does not match the one passed in by the SDK. Ensure that the correct Cloud Project Number is passed to the SDK as a string.",
i:"This parameter is automatically appended by Meet to the iframe URL. Ensure that your infrastructure does not modify URL parameters (e.g. as part of a redirect) and ensure that the correct Cloud Project Number was passed into the SDK as a string."},Dc={errorType:"DestinationNotReady",message:"The recipient frame is not connected via the addon SDK and cannot receive the notification.",i:"Make sure the destination frame has connected before sending messages to it."},Ec={errorType:"InvalidActivityStartingState",
message:"Origin of the ActivityStartingState iframeURLs does not match the origin of the URLs provided in the Add-on manifest.",i:"Ensure that the ActivityStartingState iframeURL origins match the origins of the URLs provided in the Add-on manifest."},Fc={errorType:"ActivityStartingStateMissingAttributes",message:"The supplied ActivityStartingState object does not contain any recognized attributes.",i:"Ensure that the ActivityStartingState object contains at least one of the following attributes: mainStageUrl, sidePanelUrl, additionalData."},
Gc={errorType:"ActivityStartingStateUnrecognizedAttributes",message:"The supplied ActivityStartingState object contains attributes that are not recognized.",i:"Ensure that the ActivityStartingState object has only the following attributes: mainStageUrl, sidePanelUrl, additionalData."},Hc={errorType:"AddonStartingStateMissingAttributes",message:"The supplied AddonStartingState object does not contain any recognized attributes.",i:"Ensure that the AddonStartingState object contains at least one of the following attributes: sidePanelUrl, additionalData."},
Ic={errorType:"AddonStartingStateUnrecognizedAttributes",message:"The supplied AddonStartingState object contains attributes that are not recognized.",i:"Ensure that the AddonStartingState object has only the following attributes: sidePanelUrl, additionalData."},Jc=a=>({errorType:"ArgumentNullError",message:`The argument supplied for '${a}' was 'null' but a value was expected.`,i:"Ensure you are passing a value of the expected type for the argument."}),N=(a,b,c)=>({errorType:"ArgumentTypeError",message:`The type '${b}' of argument supplied for '${a}' did not match the expected type '${c}'.`,
i:"Ensure the type of the argument provided matches the expected type."}),Kc=a=>({errorType:"InternalError",message:`Could not connect to ${a} channel. Unknown error`,i:"No further information is available."}),Mc={errorType:"ActivityIsOngoing",message:"Operation cannot be performed while an activity is ongoing.",i:"Ensure that no activity is ongoing."},Nc={errorType:"InternalError",message:"Frame message missing required Meet SDK command.",i:"Send one of the available commands in the frame message."},
Oc={errorType:"NoActivityFound",message:"No activity found.",i:"Ensure that the activity is started before performing this operation."},Pc={errorType:"RequiresEapEnrollment",message:"This feature is only available to early access partners.",i:"Meet add-on early access enrollment is currently closed."},Qc={errorType:"UserNotInitiator",message:"Operation cannot be performed because the user is not the initiator of the current activity.",i:"Ensure that the user is the initiator of the current activity or that the activity has ended."},
Rc={errorType:"SizeLimitExceededActivityStartingState",message:"The size of the activityStartingState URLs and/or its data exceed the limits allowed.",i:"Ensure that the activityStartingState URL size is less than 512 characters and the additional data size is less than 4096 characters."},Sc={errorType:"SizeLimitExceededFrameToFrameMessage",message:"The size of the frame to frame message exceeds the limits allowed.",i:"Ensure that the frame to frame message size is less than 1,000,000 characters."},
Tc={errorType:"AddonSessionAlreadyCreated",message:"The addon session has already been created.",i:"Only instantiate the AddonSession once."},Uc={errorType:"UserCancelled",message:"The user cancelled starting an activity.",i:"The user needs to click continue to start the activity."},Vc={errorType:"NotSupportedInMeetCall",message:"This method is not supported during a Meet call.",i:"Do not call this method during a Meet call."},Wc={errorType:"InvalidAddonStartingState",message:"Origin of the AddonStartingState iframeURLs does not match the origin of the URLs provided in the Add-on manifest.",
i:"Ensure that the AddonStartingState iframeURL origins match the origins of the URLs provided in the Add-on manifest."},Xc={errorType:"SizeLimitExceededAddonStartingState",message:"The size of the AddonStartingState URLs and/or its data exceed the limits allowed.",i:"Ensure that the AddonStartingState URL size is less than 512 characters and the additional data size is less than 4096 characters."},Yc={errorType:"MeetingPolicyPreventsStartingActivity",message:"A meeting policy (such as using host control settings) prevents the user from starting the activity.",
i:"Have a meeting host or administrator modify the necessary settings to allow the current user to start the activity."};function Zc(a){switch(a){case 0:return M;case 1:return Dc;case 2:return Ec;case 3:return Mc;case 4:return Nc;case 5:return Pc;case 6:return Ac;case 7:return Qc;case 8:return Rc;case 9:return Sc;case 10:return Uc;case 11:return Vc;case 12:return Wc;case 13:return Xc;case 14:return Oc;case 15:return Yc;default:return M}}
function $c(a){let b;var c=(b=I(a,1))!=null?b:0;a=ad(E(a,vc));switch(c){case 1:return{errorType:"InternalError",message:`Could not connect to ${a} channel. Meet did not respond with a MessagePort.`,i:"No further information is available."};case 2:return{errorType:"InternalError",message:`Could not connect to ${a}. A conflicting ${a} exists.`,i:"No further information is available."};case 3:return{errorType:"InternalError",message:`Could not connect to ${a} channel. The addon does not have permission to open a ${a}.`,
i:"This method might require EAP enrollment."};case 4:return{errorType:"InternalError",message:`Could not connect to ${a} channel. The addon is not authorized for this ${a}.`,i:"No further information is available."};case 0:return Kc(a);case 5:a:switch(a){case "co":c={errorType:"InternalError",message:`Could not connect to ${a} channel. The coActivity was not found.`,i:`Consider starting the ${a} only after after the startActivity promise returns.`};break a;default:c={errorType:"InternalError",message:`Could not connect to ${a} channel.`,
i:"No further information is available."}}return c;default:return Kc(a)}}function ad(a){switch(a){case 2:return"co";case 3:return"gd";case 0:return"unknown";default:return"unknown"}}function bd({errorType:a,message:b,i:c},d=""){throw new L({errorType:a,message:d?`${b} ${d}`:b,i:c});}function cd(a,b){bd({...xc,message:`${xc.message}: ${a}. In URL ${b}`})};function dd(a){var b=new ed;return F(b,1,y(a),0)}function fd(a,b){return F(a,2,z(b),"")}function gd(a,b){return F(a,3,z(b),"")}var ed=class extends K{getFrameType(){return I(this,1)}};function hd(a){var b;void 0===Ya?b=2:b=4;var c=a.m[r],d=c,e=!(2&c),f=ed;a=a.m;b=(c=!!(2&d))?1:b;e&&(e=!c);c=B(a,d,1);c=Array.isArray(c)?c:Va;var g=c[r]|0,k=!!(4&g);if(!k){var h=g;h===0&&(h=cc(h,d));g=c;h|=1;var t=d;const Ja=!!(2&h);Ja&&(t|=2);let tb=!Ja,ub=!0,Ka=0,vb=0;for(;Ka<g.length;Ka++){const wb=zb(g[Ka],f,t);if(wb instanceof f){if(!Ja){const Lc=!!((wb.m[r]|0)&2);tb&&(tb=!Lc);ub&&(ub=Lc)}g[vb++]=wb}}vb<Ka&&(g.length=vb);h|=4;h=ub?h|16:h&-17;h=tb?h|8:h&-9;g[r]=h;Ja&&Object.freeze(g);g=h}if(e&&
!(8&g||!c.length&&(b===1||b===4&&32&g))){Xb(g)&&(c=Ia(c),g=cc(g,d),d=C(a,d,1,c));e=c;f=g;for(g=0;g<e.length;g++)h=e[g],t=Tb(h),h!==t&&(e[g]=t);f|=8;f=e.length?f&-17:f|16;g=e[r]=f}let v;if(b===1||b===4&&32&g){if(!Xb(g)){d=g;var x=!!(32&g);g|=!c.length||16&g&&(!k||x)?2:2048;g!==d&&(c[r]=g);Object.freeze(c)}}else k=b!==5?!1:!!(32&g)||Xb(g)||!!Eb(c),(b===2||k)&&Xb(g)&&(c=Ia(c),g=cc(g,d),g=dc(g,d,!1),c[r]=g,d=C(a,d,1,c)),Xb(g)||(a=g,g=dc(g,d,!1),g!==a&&(c[r]=g)),k?v=Ab(c):b===2&&((x=Ib)==null||x.delete(c));
return v||c}function id(a){var b=new jd;return bc(b,a)}var jd=class extends K{};var kd=class extends K{};function ld(a){var b=new md;return F(b,1,y(a),0)}var md=class extends K{};var nd=class extends K{};var od=class extends K{};var pd=class extends K{};var rd=class extends K{getMeetingInfo(){return J(this,pd,3,qd)}getMeetPlatformInfo(){return J(this,od,4,qd)}},qd=[2,3,4,5];var sd=class extends K{},td=[1,4,5,6,7,8,9,10,11,12,13,14,15,16,17];var ud=class extends K{};var vd=class extends K{};var wd=new Map([[2,"MAIN_STAGE"],[1,"SIDE_PANEL"]]),xd=new Map([[0,"UNKNOWN"],[1,"OPEN_ADDON"],[2,"START_ACTIVITY"],[3,"JOIN_ACTIVITY"]]);function yd(a){a&&typeof a.dispose=="function"&&a.dispose()};function O(){this.s=this.s;this.g=this.g}O.prototype.s=!1;O.prototype.dispose=function(){this.s||(this.s=!0,this.G())};O.prototype[Symbol.dispose]=function(){this.dispose()};function zd(a,b){a.s?b():(a.g||(a.g=[]),a.g.push(b))}O.prototype.G=function(){if(this.g)for(;this.g.length;)this.g.shift()()};function Ad({J:a,R:b}){if(a===null)throw new L(Jc("activityStartingState"));if(b||a!==void 0){if(typeof a!=="object")throw new L(N("activityStartingState",typeof a,`object${b?"":" | undefined"}`));if(a.mainStageUrl!==void 0&&typeof a.mainStageUrl!=="string")throw new L(N("mainStageUrl",typeof a.mainStageUrl,"string | undefined"));if(a.sidePanelUrl!==void 0&&typeof a.sidePanelUrl!=="string")throw new L(N("sidePanelUrl",typeof a.sidePanelUrl,"string | undefined"));if(a.additionalData!==void 0&&typeof a.additionalData!==
"string")throw new L(N("additionalData",typeof a.additionalData,"string | undefined"));if(Object.keys(a).length!==+!!a.mainStageUrl+ +!!a.sidePanelUrl+ +!!a.additionalData)throw new L(Gc);if(Object.keys(a).length===0)throw new L(Fc);}}function Bd(a){const b=[];b.push(gd(fd(dd(2),a.mainStageUrl),a.additionalData));b.push(gd(fd(dd(1),a.sidePanelUrl),a.additionalData));return b}
var Id=class extends O{constructor(a){super();this.context=a;this.h={};Cd(this.context.g.U,b=>{switch(E(b.content,td)){case 7:const d=this.h.frameToFrameMessage;b=J(b.content,nd,7,td);if(d&&b){var c=I(b,1);c=wd.get(c);if(c===void 0)throw Error("Unknown frame type.");d({originator:c,payload:H(b,2)})}}})}async getMeetingInfo(){const a=await Dd(this.context.g,ld(2));return{meetingId:H(a.getMeetingInfo(),1),meetingCode:H(a.getMeetingInfo(),2)}}async getFrameOpenReason(){let a;const b=(a=this.context.h.ca)!=
null?a:0;let c;return(c=xd.get(b))!=null?c:"UNKNOWN"}async getActivityStartingState(){var a=J(await Dd(this.context.g,ld(1)),jd,2,qd);const b=a==null?void 0:hd(a).find(c=>c.getFrameType()===2);a=a==null?void 0:hd(a).find(c=>c.getFrameType()===1);return{mainStageUrl:(b==null?void 0:H(b,2))||void 0,sidePanelUrl:(a==null?void 0:H(a,2))||void 0,additionalData:(a==null?void 0:H(a,3))||void 0}}async setActivityStartingState(a){Ad({J:a,R:!0});var b=Bd(a);a=Ed;var c=this.context.g;var d=new ud;b=id(b);d=
ac(d,1,b);await a(c,d)}on(a,b){this.h[a]=b}async getMeetPlatformInfo(){const a=await Dd(this.context.g,ld(3));return{isMeetHardware:ec(ob(A(a.getMeetPlatformInfo(),1)),!1)}}async closeAddon(){await Fd(this.context.g)}async startActivity(a){Ad({J:a,R:!1});const b=new vd;a&&(a=Bd(a),a=id(a),ac(b,1,a));await Gd(this.context.g,b)}async endActivity(a){var b=Hd,c=this.context.g,d=new kd;a=F(d,1,y(a==="aab61ee0-51b4-475d-aa4d-849f2498640d"?999:0),0);await b(c,a)}};var Jd=mc(class extends K{getFrameOpenReason(){return I(this,5)}});function Kd(){var a=window.location.href;var b=window.location.href;var c=(new URL(b)).searchParams.get("meet_sdk");c?b=Jd(atob(c)):(cd("meet_sdk",b),b=void 0);(c=H(b,1))||cd("meet_addon_frame_type",a);c=Number(c);if(c!==2&&c!==1)throw new L(Bc);const d=H(b,2);d||cd("meet_control_channel_name",a);const e=H(b,4);e||cd("addon_cloud_project_number",a);var f;a=(f=b.getFrameOpenReason())!=null?f:0;f=H(b,3)||"https://meet.google.com";return{ca:a,frameType:c,ba:d,cloudProjectNumber:e,S:f}};var Ld=class extends K{};var Md=class extends K{};function Nd(){var a=new Od,b=new Md;return G(a,1,Pd,b)}var Od=class extends K{},Pd=[1,2];function Qd(a){var b=new Rd;return ac(b,2,a)}function Sd(a,b){return F(a,3,z(b),"")}var Rd=class extends K{};var Td=class extends K{};var Ud=class extends K{};var Vd=class extends K{};var Wd=class extends K{};var Xd=class extends K{setAddonStartingState(a){return ac(this,1,a)}};var Yd=class extends K{};function Zd(a,b){return G(a,2,P,b)}var Q=class extends K{},P=[1,2,5,6,7,8,9,10,11,13,14,15,16];var $d=class extends K{},ae=mc($d),be=[1,2];class ce{constructor(a,b){this.data=a;this.channel=b}};var de=Promise;function ee(a){const b=new MessageChannel;fe(b.port1,a);return b}function ge(a,b){fe(a,b);return new he(a)}class he{constructor(a){this.g=a}send(a,b,c=[]){b=ee(b);this.g.postMessage(a,[b.port2].concat(c))}C(a,b){return new de(c=>{this.send(a,c,b)})}}function fe(a,b){b&&(a.onmessage=c=>{var d=c.data;c=ge(c.ports[0]);b(new ce(d,c))})};var ie=typeof AsyncContext!=="undefined"&&typeof AsyncContext.Snapshot==="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function je(a,b){a.l(b);a.h<100&&(a.h++,b.next=a.g,a.g=b)}class ke{constructor(a,b){this.j=a;this.l=b;this.h=0;this.g=null}get(){let a;this.h>0?(this.h--,a=this.g,this.g=a.next,a.next=null):a=this.j();return a}};function le(){var a=me;let b=null;a.g&&(b=a.g,a.g=a.g.next,a.g||(a.h=null),b.next=null);return b}class ne{constructor(){this.h=this.g=null}add(a,b){const c=oe.get();c.set(a,b);this.h?this.h.next=c:this.g=c;this.h=c}}var oe=new ke(()=>new pe,a=>a.reset());class pe{constructor(){this.next=this.g=this.h=null}set(a,b){this.h=a;this.g=b;this.next=null}reset(){this.next=this.g=this.h=null}};let qe,re=!1,me=new ne,te=(a,b)=>{qe||se();re||(qe(),re=!0);me.add(a,b)},se=()=>{const a=Promise.resolve(void 0);qe=()=>{a.then(ue)}};function ue(){let a;for(;a=le();){try{a.h.call(a.g)}catch(b){m(b)}je(oe,a)}re=!1};function ve(){};function R(a){this.g=0;this.T=void 0;this.l=this.h=this.j=null;this.v=this.B=!1;if(a!=ve)try{const b=this;a.call(void 0,function(c){we(b,2,c)},function(c){we(b,3,c)})}catch(b){we(this,3,b)}}function xe(){this.next=this.context=this.h=this.l=this.g=null;this.j=!1}xe.prototype.reset=function(){this.context=this.h=this.l=this.g=null;this.j=!1};var ye=new ke(function(){return new xe},function(a){a.reset()});function ze(a,b,c){const d=ye.get();d.l=a;d.h=b;d.context=c;return d}
function Ae(){let a,b;const c=new R(function(d,e){a=d;b=e});return new Be(c,a,b)}R.prototype.then=function(a,b,c){return Ce(this,ie(typeof a==="function"?a:null),ie(typeof b==="function"?b:null),c)};R.prototype.$goog_Thenable=!0;function De(a,b){b=ie(b);b=ze(b,b);b.j=!0;Ee(a,b)}R.prototype.cancel=function(a){if(this.g==0){const b=new S(a);te(function(){Fe(this,b)},this)}};
function Fe(a,b){if(a.g==0)if(a.j){var c=a.j;if(c.h){var d=0,e=null,f=null;for(let g=c.h;g&&(g.j||(d++,g.g==a&&(e=g),!(e&&d>1)));g=g.next)e||(f=g);e&&(c.g==0&&d==1?Fe(c,b):(f?(d=f,d.next==c.l&&(c.l=d),d.next=d.next.next):Ge(c),He(c,e,3,b)))}a.j=null}else we(a,3,b)}function Ee(a,b){a.h||a.g!=2&&a.g!=3||Ie(a);a.l?a.l.next=b:a.h=b;a.l=b}
function Ce(a,b,c,d){const e=ze(null,null,null);e.g=new R(function(f,g){e.l=b?function(k){try{const h=b.call(d,k);f(h)}catch(h){g(h)}}:f;e.h=c?function(k){try{const h=c.call(d,k);h===void 0&&k instanceof S?g(k):f(h)}catch(h){g(h)}}:g});e.g.j=a;Ee(a,e);return e.g}R.prototype.ma=function(a){this.g=0;we(this,2,a)};R.prototype.na=function(a){this.g=0;we(this,3,a)};
function we(a,b,c){if(a.g==0){a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself"));a.g=1;a:{var d=c,e=a.ma,f=a.na;if(d instanceof R){Ee(d,ze(e||ve,f||null,a));var g=!0}else{if(d)try{var k=!!d.$goog_Thenable}catch(h){k=!1}else k=!1;if(k)d.then(e,f,a),g=!0;else{k=typeof d;if(k=="object"&&d!=null||k=="function")try{const h=d.then;if(typeof h==="function"){Je(d,h,e,f,a);g=!0;break a}}catch(h){f.call(a,h);g=!0;break a}g=!1}}}g||(a.T=c,a.g=b,a.j=null,Ie(a),b!=3||c instanceof S||Ke(a,c))}}
function Je(a,b,c,d,e){function f(h){k||(k=!0,d.call(e,h))}function g(h){k||(k=!0,c.call(e,h))}let k=!1;try{b.call(a,g,f)}catch(h){f(h)}}function Ie(a){a.B||(a.B=!0,te(a.la,a))}function Ge(a){let b=null;a.h&&(b=a.h,a.h=b.next,b.next=null);a.h||(a.l=null);return b}R.prototype.la=function(){let a;for(;a=Ge(this);)He(this,a,this.g,this.T);this.B=!1};
function He(a,b,c,d){if(c==3&&b.h&&!b.j)for(;a&&a.v;a=a.j)a.v=!1;if(b.g)b.g.j=null,Le(b,c,d);else try{b.j?b.l.call(b.context):Le(b,c,d)}catch(e){Me.call(null,e)}je(ye,b)}function Le(a,b,c){b==2?a.l.call(a.context,c):a.h&&a.h.call(a.context,c)}function Ke(a,b){a.v=!0;te(function(){a.v&&Me.call(null,b)})}var Me=m;function S(a){ha.call(this,a)}fa(S,ha);S.prototype.name="cancel";function Be(a,b,c){this.promise=a;this.resolve=b;this.reject=c};let Ne=1,Oe=new WeakMap;function Pe(a,b,c){var d=Qe;a.h.has(b);d(b,c)}var Se=class extends O{constructor(){super();this.h=new Set}signal(){const a=new Re;this.h.add(a);zd(this,ea(yd,a));return a}};function Qe(a,b){return new Promise(c=>{Te(()=>{a.L&&(a.ea=b,a.P=!0);for(const {I:d,slot:e}of a.o.values())try{e(b,{signal:a,I:d})}catch(f){m(f)}for(const d of a.A)d.resolve(b);a.A.clear();c()})})}function Cd(a,b,c){const d=Ne++;Te(()=>{Ue(a,d,b,c)});return d}
function Ue(a,b,c,d){if(!a.s)if(d){if(!d.s){const e=()=>{Te(()=>{a.o.delete(b);const f=Oe.get(d);f&&sa(f,e)})};a.o.set(b,{I:b,slot:c,F:e});Ve(d,e)}}else a.o.set(b,{I:b,slot:c,F:()=>a.o.delete(b)})}
var Re=class extends O{constructor(){super();this.L=!1;this.o=new Map;this.A=new Set;this.P=!1}detach(a){Te(()=>{const b=this.o.get(a);b&&b.F()})}value(a){return this.promise(!0,a)}next(a){return this.promise(!1,a)}promise(a,b){const c=Ae();Te(()=>{if(this.s)c.reject(new S("Signal initially disposed"));else if(b&&b.s)c.reject(new S("Owner initially disposed"));else if(a&&this.L&&this.P)c.resolve(this.ea);else if(this.A.add(c),De(c.promise,()=>{this.A.delete(c)}),b){const d=()=>{c.reject(new S("Owner asynchronously disposed"))};
De(c.promise,()=>{const e=Oe.get(b);e&&sa(e,d)});Ve(b,d)}});return c.promise}G(){super.G();Te(()=>{for(const {F:a}of this.o.values())a();this.o.clear();for(const a of this.A)a.reject(new S("Signal asynchronously disposed"));this.A.clear()})}};const We=[];let Xe=!1;function Te(a){We.push(a);Ye()}async function Ye(){if(!Xe)try{Xe=!0;let a=Ze(0);for(;a<We.length;)await Promise.resolve(),a=Ze(a)}catch(a){m(a)}finally{We.length=0,Xe=!1}}
function Ze(a){const b=a+100;for(;a<b&&a<We.length;)try{We[a++]()}catch(c){m(c)}return a}function Ve(a,b){if(a.s)b();else{var c=Oe.get(a);if(c)c.push(b);else{const d=[b];Oe.set(a,d);zd(a,()=>{for(const e of[...d])e();Oe.delete(a)})}}};function T(a){var b=new $d;a=G(b,1,be,a);return{content:hc(a)}}const $e=new Se;function af(a,b){const c=$e.signal();return{channel:ge(a,d=>{const e=b(d.data);Pe($e,c,{content:e,ka:d})}),signal:c}};let kc;var U=class extends K{};var V=class extends K{};var cf=class extends K{h(){return J(this,U,2,bf)}g(){return D(this,U,2,bf)}j(){return J(this,V,3,bf)}l(){return D(this,V,3,bf)}},bf=[2,3];var df=mc(class extends K{});var ef=mc(class extends K{}),ff=[1,2];var gf=({destination:a,origin:b,ra:c,Y:d="ZNWN1d",onMessage:e})=>{if(b==="*")throw Error("Sending to wildcard origin not allowed.");const f=ee(e);a.postMessage(c?{n:d,t:c}:d,b,[f.port2]);return ge(f.port1,e)};function hf(a,b,c){const d=new Se,e=d.signal();a=gf({destination:window.parent,origin:b,Y:a,onMessage:f=>{const g=ae(f.data.content);E(g,be)===2&&Pe(d,e,{content:J(g,sd,2,be),ka:f,messagePort:f.data.messagePort})}});return new jf(e,a,c)}async function Dd(a,b){var c=W,d=new Q;b=G(d,9,P,b);a=await c(a,T(b));let e;return(e=J(ae(a.data.content),sd,2,be))==null?void 0:J(e,rd,9,td)}async function Ed(a,b){var c=W,d=new Q;b=G(d,8,P,b);await c(a,T(b))}
async function Fd(a){var b=W;var c=new Q;var d=new Ld;c=G(c,11,P,d);await b(a,T(c))}async function Gd(a,b){var c=W,d=new Q;b=G(d,14,P,b);await c(a,T(b))}async function Hd(a,b){var c=W,d=new Q;b=G(d,15,P,b);await c(a,T(b))}async function kf(a){await a.h()}
async function W(a,b){(a=await a.channel.C(b))||bd(M,"Falsy response received from the message channel."+` ${JSON.stringify(a)}`);(b=a.data)||bd(M,"Data field in the response from the message channel is falsy."+` ${JSON.stringify(b)}`);(b=b.content)||bd(M,"Content field in the response from the message channel is falsy."+` ${JSON.stringify(b)}`);let c=void 0;try{c=ae(b)}catch(d){bd(M,"The ControlMessage can't be deserialized."+` ${JSON.stringify(b)}. ${JSON.stringify(d)}`)}(b=J(c,sd,2,be))||bd(M,
"MeetToAddonMessage field on ControlMessage is falsy."+` ${JSON.stringify(b)}`);b=b==null?void 0:J(b,wc,10,td);if((b==null?void 0:I(b,1))!==void 0)throw new L(Zc(I(b,1)));return a}async function lf(a,b,c){var d=W,e=new Q;b=G(e,1,P,b);d=await d(a,T(b));a=d.data.messagePort;var f;(d=(f=J(ae(d.data.content),sd,2,be))==null?void 0:J(f,uc,1,td))!=null?f=d:(f=new uc,f=F(f,1,y(0),0));return{channel:a?af(a,c):void 0,response:f}}
async function mf(a){const b=Nd(),{channel:c,response:d}=await lf(a,b,e=>ef(e));if(!c)throw new L($c(d));return c}async function nf(a){var b=W;var c=new Q;var d=new Yd;c=G(c,5,P,d);await b(a,T(c))}async function of(a){var b=W;var c=new Q;var d=new Td;c=G(c,6,P,d);await b(a,T(c))}async function pf(a,b,c){var d=W,e=new Q,f=new Ud;b=F(f,1,y(b),0);c=F(b,2,z(c),"");e=G(e,7,P,c);await d(a,T(e))}async function qf(a,b){var c=W,d=new Q;b=G(d,16,P,b);await c(a,T(b))}
class jf extends O{constructor(a,b,c){super();this.U=a;this.channel=b;this.h=sc(async()=>{var d=this.channel,e=d.C;var f=new Q;var g=new Vd;f=G(f,13,P,g);await e.call(d,T(f))});a=jc();H(a,4);rb(A(a,1));rb(A(a,2));rb(A(a,3));c=Zd(new Q,Sd(Qd(a),c));this.channel.send(T(c));Cd(this.U,async d=>{switch(E(d.content,td)){case 16:await kf(this)}})}};let rf;var sf=class{constructor(a){var b=rf;this.h=a;this.g=b}delete(){throw Error("Not implemented.");}};var uf=class extends K{h(){return J(this,U,2,tf)}g(){return D(this,U,2,tf)}j(){return J(this,V,3,tf)}l(){return D(this,V,3,tf)}},tf=[2,3];var vf=class extends K{};var wf=class extends K{};var xf=class extends K{};var zf=class extends K{h(){return J(this,U,2,yf)}g(){return D(this,U,2,yf)}j(){return J(this,V,3,yf)}l(){return D(this,V,3,yf)}},yf=[2,3],Af=[5,6];var Bf=class extends K{};var Cf=class extends K{},Df=[1,2,3];var Ef=class extends Error{constructor(){super("Failed to create CoActivity: Connection refused - Meet refused to begin Live Sharing")}};var Ff=class{constructor(a){this.config=a}start(){this.g!=null||(this.g=setInterval(()=>{this.config.ha()},this.config.da));return this}shutdown(){clearInterval(this.g)}};function Gf(){const a=new Map,b={set(c,d){a.set(c,d);return b},D:()=>a};return b};function Hf(a){if(a.g()){a=a.h().m;var b=a[r];var c=B(a,b,1),d=Ta(c,!0);d!=null&&d!==c&&C(a,b,1,d);a=d;b=a==null?za():a;a=Uint8Array;Ca(ya);c=b.g;if(c!=null&&!xa(c))if(typeof c==="string"){ua.test(c)&&(c=c.replace(ua,wa));c=atob(c);d=new Uint8Array(c.length);for(let e=0;e<c.length;e++)d[e]=c.charCodeAt(e);c=d}else c=null;b=c==null?c:b.g=c;return{bytes:new a(b||0)}}}function If(a,b){b=Jf(b);G(a,2,yf,b);return a}function Kf(a,b){b=Jf(b);G(a,2,tf,b);return a}
function Jf(a){var b=new U;return F(b,1,Ta(a.bytes,!1),za())}function Lf(a){if(a.l()){a=a.j();var b,c,d=H(a,1),e=(c=(b=$b(a,nc,2))==null?void 0:fc(b))!=null?c:0;c=a.m;let f=c[r];const g=B(c,f,4);b=g==null||typeof g==="number"?g:g==="NaN"||g==="Infinity"||g==="-Infinity"?Number(g):void 0;b!=null&&b!==g&&C(c,f,4,b);return{mediaId:d,mediaPlayoutPosition:e,mediaPlayoutRate:ec(b,0),playbackState:Mf.get(I(a,3))}}}function Nf(a,b){b=Of(b);G(a,3,yf,b);return a}
function Pf(a,b){b=Of(b);G(a,3,tf,b);return a}const Mf=Gf().set(0,"INVALID").set(1,"BUFFERING").set(2,"PLAY").set(3,"PAUSE").set(4,"ENDED").D(),Qf=Gf().set("INVALID",0).set("BUFFERING",1).set("PLAY",2).set("PAUSE",3).set("ENDED",4).D();
function Of(a){var b=new V;b=F(b,1,z(a.mediaId),"");var c=a.mediaPlayoutRate;if(c!=null&&typeof c!=="number")throw Error(`Value of float/double field must be a number, found ${typeof c}: ${c}`);b=F(b,4,c,0);c=new nc;c=F(c,1,sb(a.mediaPlayoutPosition),"0");b=ac(b,2,c);a=Qf.get(a.playbackState);return F(b,3,y(a),0)}function Rf({activityTitle:a}){var b=new xf;return Vb(b,4,z(a))}function Sf(a,b){var c=new wf;b=F(c,1,y(b.u),0);G(a,6,Af,b);return a}function Tf(a){var b=new vf;G(a,5,Af,b);return a};const Uf=Gf().set("co-doing",1).set("co-watching",2).D();async function Vf(a,b,c){var d=b.C,e=new Cf;var f=new Bf;f=F(f,1,z(a.activityTitle),"");var g=Uf.get(a.K);f=F(f,2,y(g),0);e=G(e,3,Df,f);d=await d.call(b,e,df);let k;if((k=ec(ob(A(d,1)),!1))!=null&&k)return new Wf(a,b,c,$b(d,cf,2));throw new Ef;}function Xf(a,b){const c=a.config.N(b);c&&!a.config.M(a.g,c)&&(a.g=c,a.j=fc(b),a.v(a.g))}function X(a,b){const {state:c,fa:d,context:e}=b(a.g);a.g=c;a.notify(a.g,e,d)}
class Wf{constructor(a,b,c,d){this.l=a;this.h=b;this.config=c;this.v=oc(e=>void this.l.O(e));Yf(this.h,e=>{const f=E(e,ff);switch(f){case 1:Xf(this,J(e,cf,1,ff));break;case 2:case 0:console.warn(`IllegalMessage: ${f} - ${"Unhandled message"} - ${"Please raise a bug with the MeetJS team"}`)}});this.B=(new Ff({da:1E3,ha:()=>{var e,f,g=(f=(e=this.l).ja)==null?void 0:f.call(e);if(this.g!==null){this.g={...this.g,...g};e=new Cf;f=this.config;g=f.W;var k=new uf;k=F(k,1,sb(this.j),"0");f=g.call(f,k,this.g);
e=G(e,1,Df,f);this.h.send(e)}}})).start();this.g=null;this.j=0;d&&Xf(this,d)}disconnect(){this.h.shutdown();this.B.shutdown()}notify(a,b,c){var d=c?Rf(c):void 0;c=this.config;var e=c.X;var f=new zf;f=F(f,1,sb(this.j),"0");d=ac(f,4,d);a=e.call(c,d,a);a=this.config.V(a,b);b=this.h;c=b.send;e=new Cf;a=G(e,2,Df,a);c.call(b,a)}};var Zf=class{constructor(a){this.g=a}broadcastStateUpdate(a){X(this.g,()=>({state:a,context:{}}))}disconnect(){this.g.disconnect()}};function $f(a,b){return a==null||b==null?!1:a.bytes.length===b.bytes.length&&a.bytes.every((c,d)=>c===b.bytes[d])};var ag=class{constructor(a){this.g=a}notifySwitchedToMedia(a,b,c){X(this.g,()=>({state:{mediaId:b,mediaPlayoutRate:1,mediaPlayoutPosition:c,playbackState:"PLAY"},fa:{activityTitle:a},context:{u:1}}))}notifyPauseState(a,b){X(this.g,c=>{if(c==null)throw Error("Invalid before coWatchingState");return{state:{...c,playbackState:a?"PAUSE":"PLAY",mediaPlayoutPosition:b},context:{u:3}}})}notifySeekToTimestamp(a){X(this.g,b=>{if(b==null)throw Error("Invalid before coWatchingState");return{state:{...b,mediaPlayoutPosition:a},
context:{u:2}}})}notifyPlayoutRate(a){X(this.g,b=>{if(b==null)throw Error("Invalid before coWatchingState");return{state:{...b,mediaPlayoutRate:a},context:{u:4}}})}notifyBuffering(a){X(this.g,b=>{if(b==null)throw Error("Invalid before coWatchingState");return{state:{...b,mediaPlayoutPosition:a,playbackState:"BUFFERING"},context:{u:3}}})}notifyReady(a){X(this.g,b=>{if(b==null)throw Error("Invalid before coWatchingState");return{state:{...b,mediaPlayoutPosition:a},context:{u:3}}})}disconnect(){this.g.disconnect()}};
function bg(a,b){if(a==null||b==null)return!1;const c=a.playbackState==="PLAY"?3*Math.max(a.mediaPlayoutRate,1):0,d=Math.abs(a.mediaPlayoutPosition-b.mediaPlayoutPosition);return a.mediaId===b.mediaId&&a.mediaPlayoutRate===b.mediaPlayoutRate&&d<=c&&a.playbackState===b.playbackState};function Yf(a,b){const c=Cd(a.signal,d=>{b(d)});a.o.push(c)}var cg=class{constructor(a,b){this.channel=a;this.signal=b;this.o=[]}send(a){this.channel.send(hc(a))}async C(a,b){a=await this.channel.C(hc(a));return b(a.data)}shutdown(){this.o.forEach(a=>{this.signal.detach(a)})}};function dg(a,b){var c=eg;const d=a.signal(),e=a.signal();Cd(b,f=>{const g=c(f)?d:e;Pe(a,g,f)},a);return{ia:d,ga:e}}function fg(a,b,c,d=e=>e){Cd(c,e=>{Pe(a,b,d(e))},a)};async function gg(a,b){if(b)return a=await Vf({activityTitle:b.activityTitle,K:"co-watching",ja:()=>b.onCoWatchingStateQuery(),O:c=>{b.onCoWatchingStateChanged(c)}},a,{X:Nf,W:Pf,V:Sf,N:Lf,M:bg}),new ag(a)}async function hg(a,b){if(b)return a=await Vf({activityTitle:b.activityTitle,K:"co-doing",O:c=>{b.onCoDoingStateChanged(c)}},a,{X:If,W:Kf,V:Tf,N:Hf,M:$f}),new Zf(a)}
async function ig(a){const b=new Se,c=b.signal();a=await a;fg(b,c,a.signal,f=>f.content);const {ia:d,ga:e}=dg(b,c);return{Z:new cg(a.channel,d),aa:new cg(a.channel,e)}}function eg(a){a:switch(E(a,ff)){case 1:a=J(a,cf,1,ff);break a;default:throw Error("CA Message arrived with no known content message set");}return a.g()};async function jg(a,b){({Z:a}=await ig(mf(a.g)));b=await hg(a,b);if(!b)throw Error("Failed to create co-doing session");return b}async function kg(a,b){({aa:a}=await ig(mf(a.g)));b=await gg(a,b);if(!b)throw Error("Failed to create co-watching session");return b};var lg=class extends Id{async notifySidePanel(a){await pf(this.context.g,1,a)}async unloadSidePanel(){await nf(this.context.g)}async loadSidePanel(){await of(this.context.g)}};var mg=class extends Id{async setAddonStartingState(a){if(a===null)throw new L(Jc("addonStartingState"));if(typeof a!=="object")throw new L(N("addonStartingState",typeof a,"object | undefined"));if(a.sidePanelUrl!==void 0&&typeof a.sidePanelUrl!=="string")throw new L(N("sidePanelUrl",typeof a.sidePanelUrl,"string | undefined"));if(a.additionalData!==void 0&&typeof a.additionalData!=="string")throw new L(N("additionalData",typeof a.additionalData,"string | undefined"));if(Object.keys(a).length!==+!!a.sidePanelUrl+
+!!a.additionalData)throw new L(Ic);if(Object.keys(a).length===0)throw new L(Hc);var b=[];b.push(gd(fd(dd(1),a.sidePanelUrl),a.additionalData));a=this.context.g;var c=new Xd,d=c.setAddonStartingState,e=new Wd;b=bc(e,b);await qf(a,d.call(c,b))}};var ng=class extends Id{async notifyMainStage(a){await pf(this.context.g,2,a)}};var og=class{constructor(a){a=a.cloudProjectNumber;const b=Kd();if(b.cloudProjectNumber!==a)throw new L(Cc);const c=b.S,d=b.ba;let e;rf=(e=rf)!=null?e:hf(d,c,a);this.g=new sf(b)}async createMainStageClient(){var a=this.g;if(a.h.frameType!==2)throw new L(yc);return await Promise.resolve(new lg(a))}async createSidePanelClient(){var a=this.g;if(a.h.frameType!==1)throw new L(zc);return await Promise.resolve(new ng(a))}async createCoWatchingClient(a){return await kg(this.g,a)}async createCoDoingClient(a){return await jg(this.g,
a)}async createRoomsStandaloneClient(){var a=this.g;if(a.h.frameType!==2)throw new L(yc);return await Promise.resolve(new mg(a))}};let pg=null;var qg={addon:{getFrameType:function(){a:{var a=Kd().frameType;switch(a){case 2:a="MAIN_STAGE";break a;case 1:a="SIDE_PANEL";break a;default:throw Error(`Unknown frame type: ${a}`);}}return a},createAddonSession:async function(a){if(a===null)throw new L(Jc("config"));if(typeof a!=="object")throw new L(N("config",typeof a,"object"));if(typeof a.cloudProjectNumber!=="string")throw new L(N("cloudProjectNumber",typeof a.cloudProjectNumber,"string"));if(pg&&Kd().S!=="integration.test.google.com")throw new L(Tc);
return pg=new og(a)}}},rg=["meet"],Y=l;rg[0]in Y||typeof Y.execScript=="undefined"||Y.execScript("var "+rg[0]);for(var Z;rg.length&&(Z=rg.shift());)rg.length||qg===void 0?Y[Z]&&Y[Z]!==Object.prototype[Z]?Y=Y[Z]:Y=Y[Z]={}:Y[Z]=qg;}).apply(topLevel);const meet = topLevel.meet;


/***/ }),

/***/ "./node_modules/cross-fetch/dist/browser-ponyfill.js":
/*!***********************************************************!*\
  !*** ./node_modules/cross-fetch/dist/browser-ponyfill.js ***!
  \***********************************************************/
/***/ ((module, exports, __webpack_require__) => {

// Save global object in a variable
var __global__ =
(typeof globalThis !== 'undefined' && globalThis) ||
(typeof self !== 'undefined' && self) ||
(typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g);
// Create an object that extends from __global__ without the fetch function
var __globalThis__ = (function () {
function F() {
this.fetch = false;
this.DOMException = __global__.DOMException
}
F.prototype = __global__; // Needed for feature detection on whatwg-fetch's code
return new F();
})();
// Wraps whatwg-fetch with a function scope to hijack the global object
// "globalThis" that's going to be patched
(function(globalThis) {

var irrelevant = (function (exports) {

  /* eslint-disable no-prototype-builtins */
  var g =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof self !== 'undefined' && self) ||
    // eslint-disable-next-line no-undef
    (typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g) ||
    {};

  var support = {
    searchParams: 'URLSearchParams' in g,
    iterable: 'Symbol' in g && 'iterator' in Symbol,
    blob:
      'FileReader' in g &&
      'Blob' in g &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in g,
    arrayBuffer: 'ArrayBuffer' in g
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
      throw new TypeError('Invalid character in header field name: "' + name + '"')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        if (header.length != 2) {
          throw new TypeError('Headers constructor: expected name/value pair to be length 2, found' + header.length)
        }
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body._noBody) return
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
    var encoding = match ? match[1] : 'utf-8';
    reader.readAsText(blob, encoding);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      /*
        fetch-mock wraps the Response object in an ES6 Proxy to
        provide useful test harness features such as flush. However, on
        ES5 browsers without fetch or Proxy support pollyfills must be used;
        the proxy-pollyfill is unable to proxy an attribute unless it exists
        on the object before the Proxy is created. This change ensures
        Response.bodyUsed exists on the instance, while maintaining the
        semantic of setting Request.bodyUsed in the constructor before
        _initBody is called.
      */
      // eslint-disable-next-line no-self-assign
      this.bodyUsed = this.bodyUsed;
      this._bodyInit = body;
      if (!body) {
        this._noBody = true;
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };
    }

    this.arrayBuffer = function() {
      if (this._bodyArrayBuffer) {
        var isConsumed = consumed(this);
        if (isConsumed) {
          return isConsumed
        } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
          return Promise.resolve(
            this._bodyArrayBuffer.buffer.slice(
              this._bodyArrayBuffer.byteOffset,
              this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
            )
          )
        } else {
          return Promise.resolve(this._bodyArrayBuffer)
        }
      } else if (support.blob) {
        return this.blob().then(readBlobAsArrayBuffer)
      } else {
        throw new Error('could not read as ArrayBuffer')
      }
    };

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    if (!(this instanceof Request)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }

    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal || (function () {
      if ('AbortController' in g) {
        var ctrl = new AbortController();
        return ctrl.signal;
      }
    }());
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);

    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        // Search for a '_' parameter in the query string
        var reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          // If it already exists then set the value with the current time
          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
        } else {
          // Otherwise add a new '_' parameter to the end with the current time
          var reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
        }
      }
    }
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
    // https://github.com/github/fetch/issues/748
    // https://github.com/zloirock/core-js/issues/751
    preProcessedHeaders
      .split('\r')
      .map(function(header) {
        return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
      })
      .forEach(function(line) {
        var parts = line.split(':');
        var key = parts.shift().trim();
        if (key) {
          var value = parts.join(':').trim();
          try {
            headers.append(key, value);
          } catch (error) {
            console.warn('Response ' + error.message);
          }
        }
      });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!(this instanceof Response)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    if (this.status < 200 || this.status > 599) {
      throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].")
    }
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 200, statusText: ''});
    response.ok = false;
    response.status = 0;
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = g.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        // This check if specifically for when a user fetches a file locally from the file system
        // Only if the status is out of a normal range
        if (request.url.indexOf('file://') === 0 && (xhr.status < 200 || xhr.status > 599)) {
          options.status = 200;
        } else {
          options.status = xhr.status;
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        setTimeout(function() {
          resolve(new Response(body, options));
        }, 0);
      };

      xhr.onerror = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.ontimeout = function() {
        setTimeout(function() {
          reject(new TypeError('Network request timed out'));
        }, 0);
      };

      xhr.onabort = function() {
        setTimeout(function() {
          reject(new exports.DOMException('Aborted', 'AbortError'));
        }, 0);
      };

      function fixUrl(url) {
        try {
          return url === '' && g.location.href ? g.location.href : url
        } catch (e) {
          return url
        }
      }

      xhr.open(request.method, fixUrl(request.url), true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr) {
        if (support.blob) {
          xhr.responseType = 'blob';
        } else if (
          support.arrayBuffer
        ) {
          xhr.responseType = 'arraybuffer';
        }
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers || (g.Headers && init.headers instanceof g.Headers))) {
        var names = [];
        Object.getOwnPropertyNames(init.headers).forEach(function(name) {
          names.push(normalizeName(name));
          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
        });
        request.headers.forEach(function(value, name) {
          if (names.indexOf(name) === -1) {
            xhr.setRequestHeader(name, value);
          }
        });
      } else {
        request.headers.forEach(function(value, name) {
          xhr.setRequestHeader(name, value);
        });
      }

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!g.fetch) {
    g.fetch = fetch;
    g.Headers = Headers;
    g.Request = Request;
    g.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
})(__globalThis__);
// This is a ponyfill, so...
__globalThis__.fetch.ponyfill = true;
delete __globalThis__.fetch.polyfill;
// Choose between native implementation (__global__) or custom implementation (__globalThis__)
var ctx = __global__.fetch ? __global__ : __globalThis__;
exports = ctx.fetch // To enable: import fetch from 'cross-fetch'
exports["default"] = ctx.fetch // For TypeScript consumers without esModuleInterop.
exports.fetch = ctx.fetch // To enable: import {fetch} from 'cross-fetch'
exports.Headers = ctx.Headers
exports.Request = ctx.Request
exports.Response = ctx.Response
module.exports = exports


/***/ }),

/***/ "./node_modules/dayjs/dayjs.min.js":
/*!*****************************************!*\
  !*** ./node_modules/dayjs/dayjs.min.js ***!
  \*****************************************/
/***/ (function(module) {

!function(t,e){ true?module.exports=e():0}(this,(function(){"use strict";var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",c="month",f="quarter",h="year",d="date",l="Invalid Date",$=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],n=t%100;return"["+t+(e[(n-20)%10]||e[n]||e[0])+"]"}},m=function(t,e,n){var r=String(t);return!r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},v={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return(e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return-t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,c),s=n-i<0,u=e.clone().add(r+(s?-1:1),c);return+(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:c,y:h,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:f}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},g="en",D={};D[g]=M;var p="$isDayjsObject",S=function(t){return t instanceof _||!(!t||!t[p])},w=function t(e,n,r){var i;if(!e)return g;if("string"==typeof e){var s=e.toLowerCase();D[s]&&(i=s),n&&(D[s]=n,i=s);var u=e.split("-");if(!i&&u.length>1)return t(u[0])}else{var a=e.name;D[a]=e,i=a}return!r&&i&&(g=i),i||!r&&g},O=function(t,e){if(S(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},b=v;b.l=w,b.i=S,b.w=function(t,e){return O(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=w(t.locale,null,!0),this.parse(t),this.$x=this.$x||t.x||{},this[p]=!0}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(b.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match($);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.init()},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},m.$utils=function(){return b},m.isValid=function(){return!(this.$d.toString()===l)},m.isSame=function(t,e){var n=O(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return O(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<O(t)},m.$g=function(t,e,n){return b.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!b.u(e)||e,f=b.p(t),l=function(t,e){var i=b.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},$=function(t,e){return b.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,v="set"+(this.$u?"UTC":"");switch(f){case h:return r?l(1,0):l(31,11);case c:return r?l(1,M):l(0,M+1);case o:var g=this.$locale().weekStart||0,D=(y<g?y+7:y)-g;return l(r?m-D:m+(6-D),M);case a:case d:return $(v+"Hours",0);case u:return $(v+"Minutes",1);case s:return $(v+"Seconds",2);case i:return $(v+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=b.p(t),f="set"+(this.$u?"UTC":""),l=(n={},n[a]=f+"Date",n[d]=f+"Date",n[c]=f+"Month",n[h]=f+"FullYear",n[u]=f+"Hours",n[s]=f+"Minutes",n[i]=f+"Seconds",n[r]=f+"Milliseconds",n)[o],$=o===a?this.$D+(e-this.$W):e;if(o===c||o===h){var y=this.clone().set(d,1);y.$d[l]($),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d}else l&&this.$d[l]($);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[b.p(t)]()},m.add=function(r,f){var d,l=this;r=Number(r);var $=b.p(f),y=function(t){var e=O(l);return b.w(e.date(e.date()+Math.round(t*r)),l)};if($===c)return this.set(c,this.$M+r);if($===h)return this.set(h,this.$y+r);if($===a)return y(1);if($===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[$]||1,m=this.$d.getTime()+r*M;return b.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||l;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=b.z(this),s=this.$H,u=this.$m,a=this.$M,o=n.weekdays,c=n.months,f=n.meridiem,h=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].slice(0,s)},d=function(t){return b.s(s%12||12,t,"0")},$=f||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r};return r.replace(y,(function(t,r){return r||function(t){switch(t){case"YY":return String(e.$y).slice(-2);case"YYYY":return b.s(e.$y,4,"0");case"M":return a+1;case"MM":return b.s(a+1,2,"0");case"MMM":return h(n.monthsShort,a,c,3);case"MMMM":return h(c,a);case"D":return e.$D;case"DD":return b.s(e.$D,2,"0");case"d":return String(e.$W);case"dd":return h(n.weekdaysMin,e.$W,o,2);case"ddd":return h(n.weekdaysShort,e.$W,o,3);case"dddd":return o[e.$W];case"H":return String(s);case"HH":return b.s(s,2,"0");case"h":return d(1);case"hh":return d(2);case"a":return $(s,u,!0);case"A":return $(s,u,!1);case"m":return String(u);case"mm":return b.s(u,2,"0");case"s":return String(e.$s);case"ss":return b.s(e.$s,2,"0");case"SSS":return b.s(e.$ms,3,"0");case"Z":return i}return null}(t)||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,l){var $,y=this,M=b.p(d),m=O(r),v=(m.utcOffset()-this.utcOffset())*e,g=this-m,D=function(){return b.m(y,m)};switch(M){case h:$=D()/12;break;case c:$=D();break;case f:$=D()/3;break;case o:$=(g-v)/6048e5;break;case a:$=(g-v)/864e5;break;case u:$=g/n;break;case s:$=g/e;break;case i:$=g/t;break;default:$=g}return l?$:b.a($)},m.daysInMonth=function(){return this.endOf(c).$D},m.$locale=function(){return D[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=w(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return b.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),k=_.prototype;return O.prototype=k,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",c],["$y",h],["$D",d]].forEach((function(t){k[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),O.extend=function(t,e){return t.$i||(t(e,_,O),t.$i=!0),O},O.locale=w,O.isDayjs=S,O.unix=function(t){return O(1e3*t)},O.en=D[g],O.Ls=D,O.p={},O}));

/***/ }),

/***/ "./node_modules/dayjs/plugin/utc.js":
/*!******************************************!*\
  !*** ./node_modules/dayjs/plugin/utc.js ***!
  \******************************************/
/***/ (function(module) {

!function(t,i){ true?module.exports=i():0}(this,(function(){"use strict";var t="minute",i=/[+-]\d\d(?::?\d\d)?/g,e=/([+-]|\d\d)/g;return function(s,f,n){var u=f.prototype;n.utc=function(t){var i={date:t,utc:!0,args:arguments};return new f(i)},u.utc=function(i){var e=n(this.toDate(),{locale:this.$L,utc:!0});return i?e.add(this.utcOffset(),t):e},u.local=function(){return n(this.toDate(),{locale:this.$L,utc:!1})};var r=u.parse;u.parse=function(t){t.utc&&(this.$u=!0),this.$utils().u(t.$offset)||(this.$offset=t.$offset),r.call(this,t)};var o=u.init;u.init=function(){if(this.$u){var t=this.$d;this.$y=t.getUTCFullYear(),this.$M=t.getUTCMonth(),this.$D=t.getUTCDate(),this.$W=t.getUTCDay(),this.$H=t.getUTCHours(),this.$m=t.getUTCMinutes(),this.$s=t.getUTCSeconds(),this.$ms=t.getUTCMilliseconds()}else o.call(this)};var a=u.utcOffset;u.utcOffset=function(s,f){var n=this.$utils().u;if(n(s))return this.$u?0:n(this.$offset)?a.call(this):this.$offset;if("string"==typeof s&&(s=function(t){void 0===t&&(t="");var s=t.match(i);if(!s)return null;var f=(""+s[0]).match(e)||["-",0,0],n=f[0],u=60*+f[1]+ +f[2];return 0===u?0:"+"===n?u:-u}(s),null===s))return this;var u=Math.abs(s)<=16?60*s:s;if(0===u)return this.utc(f);var r=this.clone();if(f)return r.$offset=u,r.$u=!1,r;var o=this.$u?this.toDate().getTimezoneOffset():-1*this.utcOffset();return(r=this.local().add(u+o,t)).$offset=u,r.$x.$localOffset=o,r};var h=u.format;u.format=function(t){var i=t||(this.$u?"YYYY-MM-DDTHH:mm:ss[Z]":"");return h.call(this,i)},u.valueOf=function(){var t=this.$utils().u(this.$offset)?0:this.$offset+(this.$x.$localOffset||this.$d.getTimezoneOffset());return this.$d.valueOf()-6e4*t},u.isUTC=function(){return!!this.$u},u.toISOString=function(){return this.toDate().toISOString()},u.toString=function(){return this.toDate().toUTCString()};var l=u.toDate;u.toDate=function(t){return"s"===t&&this.$offset?n(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate():l.call(this)};var c=u.diff;u.diff=function(t,i,e){if(t&&this.$u===t.$u)return c.call(this,t,i,e);var s=this.local(),f=n(t).local();return c.call(s,f,i,e)}}}));

/***/ }),

/***/ "./node_modules/deepmerge/dist/cjs.js":
/*!********************************************!*\
  !*** ./node_modules/deepmerge/dist/cjs.js ***!
  \********************************************/
/***/ ((module) => {

"use strict";


var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

module.exports = deepmerge_1;


/***/ }),

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./src/deepgram-integration.js":
/*!*************************************!*\
  !*** ./src/deepgram-integration.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AudioCapture: () => (/* binding */ AudioCapture),
/* harmony export */   DeepgramTranscriber: () => (/* binding */ DeepgramTranscriber),
/* harmony export */   MeetParticipantManager: () => (/* binding */ MeetParticipantManager),
/* harmony export */   TranscriptionManager: () => (/* binding */ TranscriptionManager)
/* harmony export */ });
/* harmony import */ var _deepgram_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @deepgram/sdk */ "./node_modules/@deepgram/sdk/dist/module/index.js");
/**
 * Deepgram Integration for Live Transcription
 * This module handles real-time speech-to-text conversion using Deepgram's WebSocket API
 */



class DeepgramTranscriber {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.connection = null;
    this.participants = new Map();
    this.isConnected = false;
    this.options = {
      model: 'nova-2',
      language: 'en-US',
      punctuate: true,
      profanity_filter: false,
      redact: false,
      diarize: true, // Enable speaker diarization
      ...options
    };
  }

  /**
   * Initialize Deepgram WebSocket connection
   */
  async connect() {
    try {
      // Create Deepgram client
      const deepgram = (0,_deepgram_sdk__WEBPACK_IMPORTED_MODULE_0__.createClient)(this.apiKey);
      
      // Create live transcription connection
      this.connection = deepgram.listen.live({
        model: this.options.model,
        language: this.options.language,
        punctuate: this.options.punctuate,
        profanity_filter: this.options.profanity_filter,
        redact: this.options.redact,
        diarize: this.options.diarize,
        interim_results: true,
        smart_format: true,
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1
      });
      
      this.connection.on('Open', () => {
        console.log('Deepgram WebSocket connected');
        this.isConnected = true;
        this.onConnectionOpen();
      });
      
      this.connection.on('Results', (data) => {
        this.handleTranscriptionResult(data);
      });
      
      this.connection.on('Error', (error) => {
        console.error('Deepgram WebSocket error:', error);
        this.onConnectionError(error);
      });
      
      this.connection.on('Close', () => {
        console.log('Deepgram WebSocket closed');
        this.isConnected = false;
        this.onConnectionClose();
      });
      
    } catch (error) {
      console.error('Error connecting to Deepgram:', error);
      throw error;
    }
  }

  /**
   * Send audio data to Deepgram
   */
  sendAudio(audioData) {
    if (this.connection && this.isConnected) {
      this.connection.send(audioData);
    }
  }

  /**
   * Handle transcription results from Deepgram
   */
  handleTranscriptionResult(data) {
    if (data.channel && data.channel.alternatives && data.channel.alternatives.length > 0) {
      const transcript = data.channel.alternatives[0].transcript;
      const confidence = data.channel.alternatives[0].confidence;
      
      // Extract speaker information if diarization is enabled
      let speakerId = null;
      if (data.channel.alternatives[0].words && data.channel.alternatives[0].words.length > 0) {
        speakerId = data.channel.alternatives[0].words[0].speaker;
      }
      
      if (transcript && transcript.trim()) {
        this.onTranscriptReceived({
          transcript: transcript.trim(),
          confidence,
          speakerId,
          isFinal: data.is_final,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Disconnect from Deepgram
   */
  disconnect() {
    if (this.connection) {
      this.connection.finish();
      this.connection = null;
    }
    this.isConnected = false;
  }

  /**
   * Event handlers - to be overridden by the main application
   */
  onConnectionOpen() {
    console.log('Deepgram connection established');
  }

  onConnectionError(error) {
    console.error('Deepgram connection error:', error);
  }

  onConnectionClose() {
    console.log('Deepgram connection closed');
  }

  onTranscriptReceived(transcriptData) {
    console.log('Transcript received:', transcriptData);
  }
}

/**
 * Audio Capture Utility
 * Handles capturing audio from the user's microphone
 */
class AudioCapture {
  constructor() {
    this.mediaStream = null;
    this.audioContext = null;
    this.processor = null;
    this.isCapturing = false;
  }

  /**
   * Start capturing audio from microphone
   */
  async startCapture() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create a script processor for real-time audio processing
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert Float32Array to Int16Array for Deepgram
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        this.onAudioData(int16Data);
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      this.isCapturing = true;
      console.log('Audio capture started');
      
    } catch (error) {
      console.error('Error starting audio capture:', error);
      throw error;
    }
  }

  /**
   * Stop capturing audio
   */
  stopCapture() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    this.isCapturing = false;
    console.log('Audio capture stopped');
  }

  /**
   * Event handler for audio data - to be overridden
   */
  onAudioData(audioData) {
    // This will be called with audio data in real-time
    // The main application should send this to Deepgram
  }
}

/**
 * Meet Participant Integration
 * Handles integration with Google Meet's participant API
 */
class MeetParticipantManager {
  constructor() {
    this.participants = new Map();
    this.onParticipantChange = null;
  }

  /**
   * Initialize participant tracking
   */
  async initialize() {
    // In a real implementation, you would integrate with Meet's participant API
    // For now, we'll simulate participant detection
    this.simulateParticipants();
  }

  /**
   * Simulate participants for demonstration
   */
  simulateParticipants() {
    const mockParticipants = [
      { id: 'user1', name: 'John Doe', avatar: '👨‍💼', isLocal: true },
      { id: 'user2', name: 'Jane Smith', avatar: '👩‍💼', isLocal: false },
      { id: 'user3', name: 'Bob Johnson', avatar: '👨‍🔬', isLocal: false },
      { id: 'user4', name: 'Alice Brown', avatar: '👩‍🎨', isLocal: false }
    ];

    mockParticipants.forEach(participant => {
      this.participants.set(participant.id, {
        ...participant,
        transcript: '',
        isSpeaking: false,
        lastSpoke: null,
        confidence: 0
      });
    });

    if (this.onParticipantChange) {
      this.onParticipantChange(Array.from(this.participants.values()));
    }
  }

  /**
   * Get participant by ID
   */
  getParticipant(id) {
    return this.participants.get(id);
  }

  /**
   * Update participant transcript
   */
  updateParticipantTranscript(id, transcript, confidence = 0) {
    const participant = this.participants.get(id);
    if (participant) {
      participant.transcript += (participant.transcript ? ' ' : '') + transcript;
      participant.confidence = confidence;
      participant.lastSpoke = new Date().toLocaleTimeString();
      
      if (this.onParticipantChange) {
        this.onParticipantChange(Array.from(this.participants.values()));
      }
    }
  }

  /**
   * Set participant speaking status
   */
  setParticipantSpeaking(id, isSpeaking) {
    const participant = this.participants.get(id);
    if (participant) {
      participant.isSpeaking = isSpeaking;
      
      if (this.onParticipantChange) {
        this.onParticipantChange(Array.from(this.participants.values()));
      }
    }
  }

  /**
   * Get all participants
   */
  getAllParticipants() {
    return Array.from(this.participants.values());
  }
}

/**
 * Main Transcription Manager
 * Orchestrates the entire transcription process
 */
class TranscriptionManager {
  constructor(deepgramApiKey) {
    this.deepgram = new DeepgramTranscriber(deepgramApiKey);
    this.audioCapture = new AudioCapture();
    this.participantManager = new MeetParticipantManager();
    this.isTranscribing = false;
    
    this.setupEventHandlers();
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Handle Deepgram events
    this.deepgram.onTranscriptReceived = (transcriptData) => {
      this.handleTranscript(transcriptData);
    };

    this.deepgram.onConnectionOpen = () => {
      console.log('Deepgram connected successfully');
    };

    this.deepgram.onConnectionError = (error) => {
      console.error('Deepgram connection error:', error);
    };

    this.deepgram.onConnectionClose = () => {
      console.log('Deepgram connection closed');
    };

    // Handle audio capture
    this.audioCapture.onAudioData = (audioData) => {
      if (this.isTranscribing) {
        this.deepgram.sendAudio(audioData);
      }
    };

    // Handle participant changes
    this.participantManager.onParticipantChange = (participants) => {
      this.onParticipantsUpdated(participants);
    };
  }

  /**
   * Start transcription
   */
  async startTranscription() {
    try {
      console.log('Starting transcription...');
      
      // Initialize participant tracking
      await this.participantManager.initialize();
      
      // Connect to Deepgram
      await this.deepgram.connect();
      
      // Start audio capture
      await this.audioCapture.startCapture();
      
      this.isTranscribing = true;
      console.log('Transcription started successfully');
      
    } catch (error) {
      console.error('Error starting transcription:', error);
      throw error;
    }
  }

  /**
   * Stop transcription
   */
  async stopTranscription() {
    try {
      console.log('Stopping transcription...');
      
      this.isTranscribing = false;
      
      // Stop audio capture
      this.audioCapture.stopCapture();
      
      // Disconnect from Deepgram
      this.deepgram.disconnect();
      
      console.log('Transcription stopped successfully');
      
    } catch (error) {
      console.error('Error stopping transcription:', error);
      throw error;
    }
  }

  /**
   * Handle transcript data from Deepgram
   */
  handleTranscript(transcriptData) {
    const { transcript, confidence, speakerId, isFinal } = transcriptData;
    
    if (transcript && isFinal) {
      // Map speaker ID to participant
      const participantId = this.mapSpeakerToParticipant(speakerId);
      
      if (participantId) {
        this.participantManager.updateParticipantTranscript(participantId, transcript, confidence);
        this.participantManager.setParticipantSpeaking(participantId, true);
        
        // Stop speaking indicator after 3 seconds
        setTimeout(() => {
          this.participantManager.setParticipantSpeaking(participantId, false);
        }, 3000);
      }
    }
  }

  /**
   * Map Deepgram speaker ID to participant ID
   */
  mapSpeakerToParticipant(speakerId) {
    // In a real implementation, you would maintain a mapping between
    // Deepgram speaker IDs and Meet participant IDs
    // For now, we'll use a simple mapping
    const speakerMapping = {
      0: 'user1',
      1: 'user2',
      2: 'user3',
      3: 'user4'
    };
    
    return speakerMapping[speakerId] || 'user1';
  }

  /**
   * Event handler for participant updates
   */
  onParticipantsUpdated(participants) {
    // This will be called when participants are updated
    // The main application should handle UI updates
    console.log('Participants updated:', participants);
  }

  /**
   * Get current transcription status
   */
  getStatus() {
    return {
      isTranscribing: this.isTranscribing,
      isDeepgramConnected: this.deepgram.isConnected,
      isAudioCapturing: this.audioCapture.isCapturing,
      participants: this.participantManager.getAllParticipants()
    };
  }
}



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; (typeof current == 'object' || typeof current == 'function') && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "transcriptAddon:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunktranscriptAddon"] = self["webpackChunktranscriptAddon"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initializeMainStage: () => (/* binding */ initializeMainStage),
/* harmony export */   setUpAddon: () => (/* binding */ setUpAddon)
/* harmony export */ });
/* harmony import */ var _googleworkspace_meet_addons_meet_addons__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @googleworkspace/meet-addons/meet.addons */ "./node_modules/@googleworkspace/meet-addons/meet.addons.mjs");
/* harmony import */ var _deepgram_integration_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./deepgram-integration.js */ "./src/deepgram-integration.js");



const CLOUD_PROJECT_NUMBER = 'YOUR_CLOUD_PROJECT_NUMBER';
const MAIN_STAGE_URL = 'YOUR_MAIN_STAGE_URL';
const DEEPGRAM_API_KEY = '306114cbf5e0f315e34cc259af3d16b9fe000992';

let sidePanelClient;
let mainStageClient;
let participants = new Map();
let transcriptContainer;
let isTranscribing = false;
let transcriptionManager = null;

/**
 * Initialize Deepgram client for real-time transcription
 */
function initializeDeepgram() {
  console.log('Initializing Deepgram client...');
  
  try {
    // Create transcription manager with Deepgram API key
    transcriptionManager = new _deepgram_integration_js__WEBPACK_IMPORTED_MODULE_1__.TranscriptionManager(DEEPGRAM_API_KEY);
    
    // Set up event handlers
    transcriptionManager.onParticipantsUpdated = (updatedParticipants) => {
      // Update our local participants map
      participants.clear();
      updatedParticipants.forEach(participant => {
        participants.set(participant.id, participant);
      });
      updateParticipantDisplay();
    };
    
    // Set up transcript handling
    transcriptionManager.deepgram.onTranscriptReceived = (transcriptData) => {
      handleTranscriptUpdate(transcriptData);
    };
    
    console.log('Deepgram client initialized successfully');
  } catch (error) {
    console.error('Error initializing Deepgram:', error);
    showStatus('Error initializing Deepgram: ' + error.message, 'error');
  }
}

/**
 * Request microphone permissions
 */
async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000
      }
    });
    
    // Stop the stream immediately - we just needed permission
    stream.getTracks().forEach(track => track.stop());
    
    console.log('Microphone permission granted');
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    showStatus('Microphone permission required for transcription', 'error');
    return false;
  }
}

/**
 * Set up the add-on side panel
 */
async function setUpAddon() {
  try {
    const session = await _googleworkspace_meet_addons_meet_addons__WEBPACK_IMPORTED_MODULE_0__.meet.addon.createAddonSession({
      cloudProjectNumber: CLOUD_PROJECT_NUMBER,
    });
    
    sidePanelClient = await session.createSidePanelClient();
    
    // Initialize Deepgram
    initializeDeepgram();
    
    // Set up event listeners
    const startActivityBtn = document.getElementById('start-activity');
    const startTranscriptBtn = document.getElementById('start-transcript');
    const stopTranscriptBtn = document.getElementById('stop-transcript');
    
    if (startActivityBtn) {
      startActivityBtn.addEventListener('click', async () => {
        try {
          await sidePanelClient.startActivity({
            mainStageUrl: MAIN_STAGE_URL
          });
          showStatus('Activity started successfully!', 'success');
        } catch (error) {
          console.error('Error starting activity:', error);
          showStatus('Error starting activity: ' + error.message, 'error');
        }
      });
    }
    
    if (startTranscriptBtn) {
      startTranscriptBtn.addEventListener('click', startTranscript);
    }
    
    if (stopTranscriptBtn) {
      stopTranscriptBtn.addEventListener('click', stopTranscript);
    }
    
    console.log('Add-on initialized successfully');
    showStatus('Add-on loaded successfully!', 'success');
  } catch (error) {
    console.error('Error setting up add-on:', error);
    showStatus('Error initializing add-on: ' + error.message, 'error');
  }
}

/**
 * Initialize main stage
 */
async function initializeMainStage() {
  try {
    const session = await _googleworkspace_meet_addons_meet_addons__WEBPACK_IMPORTED_MODULE_0__.meet.addon.createAddonSession({
      cloudProjectNumber: CLOUD_PROJECT_NUMBER,
    });
    
    mainStageClient = await session.createMainStageClient();
    
    // Create transcript UI
    createTranscriptUI();
    
    // Start listening for participants
    startParticipantTracking();
    
    console.log('Main stage initialized successfully');
  } catch (error) {
    console.error('Error initializing main stage:', error);
  }
}

/**
 * Create the transcript UI
 */
function createTranscriptUI() {
  const container = document.createElement('div');
  container.id = 'transcript-container';
  container.style.cssText = `
    width: 100%;
    height: 100vh;
    padding: 20px;
    font-family: 'Google Sans', Arial, sans-serif;
    background: #f8f9fa;
    box-sizing: border-box;
  `;
  
  const header = document.createElement('div');
  header.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  `;
  
  header.innerHTML = `
    <h1 style="color: #1a73e8; margin: 0 0 20px 0; font-size: 28px;">🎤 Live Transcript</h1>
    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
      <button id="start-transcript-btn" style="
        padding: 12px 24px; 
        background: #34a853; 
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        transition: background-color 0.2s;
      ">Start Live Transcript</button>
      <button id="stop-transcript-btn" style="
        padding: 12px 24px; 
        background: #ea4335; 
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        transition: background-color 0.2s;
        opacity: 0.6;
        cursor: not-allowed;
      " disabled>Stop Transcript</button>
    </div>
    <div id="transcript-status" style="
      padding: 10px;
      border-radius: 4px;
      font-size: 14px;
      background: #e8f0fe;
      color: #1a73e8;
      display: none;
    ">Ready to start transcription</div>
  `;
  
  const transcriptArea = document.createElement('div');
  transcriptArea.id = 'transcript-area';
  transcriptArea.style.cssText = `
    background: white;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 20px;
    height: calc(100vh - 200px);
    overflow-y: auto;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  `;
  
  container.appendChild(header);
  container.appendChild(transcriptArea);
  document.body.appendChild(container);
  
  transcriptContainer = transcriptArea;
  
  // Add event listeners for buttons
  document.getElementById('start-transcript-btn')?.addEventListener('click', startTranscript);
  document.getElementById('stop-transcript-btn')?.addEventListener('click', stopTranscript);
}

/**
 * Start participant tracking
 */
function startParticipantTracking() {
  console.log('Starting participant tracking...');
  
  // Initialize with mock participants for demonstration
  // In a real implementation, you would integrate with Meet's participant API
  const mockParticipants = [
    { id: 'user1', name: 'John Doe', avatar: '👨‍💼', isLocal: true },
    { id: 'user2', name: 'Jane Smith', avatar: '👩‍💼', isLocal: false },
    { id: 'user3', name: 'Bob Johnson', avatar: '👨‍🔬', isLocal: false },
    { id: 'user4', name: 'Alice Brown', avatar: '👩‍🎨', isLocal: false }
  ];
  
  mockParticipants.forEach(participant => {
    participants.set(participant.id, {
      ...participant,
      transcript: '',
      isSpeaking: false,
      lastSpoke: null,
      confidence: 0
    });
  });
  
  // If transcription manager is available, use it for real participant tracking
  if (transcriptionManager) {
    transcriptionManager.participantManager.simulateParticipants();
  }
  
  updateParticipantDisplay();
}

/**
 * Update participant display
 */
function updateParticipantDisplay() {
  if (!transcriptContainer) return;
  
  transcriptContainer.innerHTML = '';
  
  if (participants.size === 0) {
    transcriptContainer.innerHTML = `
      <div style="
        text-align: center; 
        color: #5f6368; 
        padding: 40px;
        font-size: 16px;
      ">
        No participants detected. Waiting for participants to join...
      </div>
    `;
    return;
  }
  
  participants.forEach((participant, id) => {
    const participantDiv = document.createElement('div');
    participantDiv.style.cssText = `
      margin-bottom: 20px;
      padding: 20px;
      border: 2px solid ${participant.isSpeaking ? '#1a73e8' : '#e0e0e0'};
      border-radius: 12px;
      background: ${participant.isSpeaking ? '#e8f0fe' : '#ffffff'};
      transition: all 0.3s ease;
      position: relative;
    `;
    
    const speakingIndicator = participant.isSpeaking ? `
      <div style="
        position: absolute;
        top: 10px;
        right: 15px;
        background: #1a73e8;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        animation: pulse 1s infinite;
      ">🎤 Speaking</div>
    ` : '';
    
    participantDiv.innerHTML = `
      ${speakingIndicator}
      <div style="
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        font-weight: 600;
        color: #1a73e8;
        font-size: 18px;
      ">
        <span style="font-size: 24px; margin-right: 10px;">${participant.avatar}</span>
        ${participant.name}
      </div>
      <div style="
        color: #5f6368;
        line-height: 1.6;
        font-size: 16px;
        min-height: 24px;
      ">
        ${participant.transcript || '<span style="color: #9aa0a6; font-style: italic;">No transcript yet...</span>'}
      </div>
      ${participant.lastSpoke ? `
        <div style="
          color: #9aa0a6;
          font-size: 12px;
          margin-top: 10px;
          text-align: right;
        ">
          Last spoke: ${participant.lastSpoke}
        </div>
      ` : ''}
    `;
    
    transcriptContainer.appendChild(participantDiv);
  });
  
  // Add CSS for pulse animation
  if (!document.getElementById('transcript-styles')) {
    const style = document.createElement('style');
    style.id = 'transcript-styles';
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Start transcript functionality
 */
async function startTranscript() {
  console.log('Starting transcript...');
  
  try {
    // Request microphone permission first
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      throw new Error('Microphone permission required');
    }
    
    // Update UI
    const startBtn = document.getElementById('start-transcript-btn');
    const stopBtn = document.getElementById('stop-transcript-btn');
    const status = document.getElementById('transcript-status');
    
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    if (status) {
      status.style.display = 'block';
      status.style.background = '#e8f5e8';
      status.style.color = '#137333';
      status.textContent = '🎤 Live transcription active - listening to all participants';
    }
    
    // Start real Deepgram transcription
    await startDeepgramConnection();
    
    isTranscribing = true;
    console.log('Transcription started successfully');
    
  } catch (error) {
    console.error('Error starting transcription:', error);
    showStatus('Error starting transcription: ' + error.message, 'error');
    
    // Reset UI on error
    const startBtn = document.getElementById('start-transcript-btn');
    const stopBtn = document.getElementById('stop-transcript-btn');
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  }
}

/**
 * Stop transcript functionality
 */
async function stopTranscript() {
  console.log('Stopping transcript...');
  
  try {
    // Stop real Deepgram transcription
    await stopDeepgramConnection();
    
    isTranscribing = false;
    
    // Update UI
    const startBtn = document.getElementById('start-transcript-btn');
    const stopBtn = document.getElementById('stop-transcript-btn');
    const status = document.getElementById('transcript-status');
    
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    if (status) {
      status.style.background = '#fce8e6';
      status.style.color = '#d93025';
      status.textContent = '⏹️ Transcription stopped';
    }
    
    console.log('Transcription stopped successfully');
    
  } catch (error) {
    console.error('Error stopping transcription:', error);
    showStatus('Error stopping transcription: ' + error.message, 'error');
  }
}

/**
 * Start Deepgram connection
 */
async function startDeepgramConnection() {
  console.log('Starting Deepgram connection...');
  
  if (!transcriptionManager) {
    throw new Error('Transcription manager not initialized');
  }
  
  try {
    await transcriptionManager.startTranscription();
    console.log('Deepgram connection started successfully');
  } catch (error) {
    console.error('Error starting Deepgram connection:', error);
    throw error;
  }
}

/**
 * Stop Deepgram connection
 */
async function stopDeepgramConnection() {
  console.log('Stopping Deepgram connection...');
  
  if (!transcriptionManager) {
    console.warn('Transcription manager not initialized');
    return;
  }
  
  try {
    await transcriptionManager.stopTranscription();
    console.log('Deepgram connection stopped successfully');
  } catch (error) {
    console.error('Error stopping Deepgram connection:', error);
    throw error;
  }
}

/**
 * Handle real-time transcript updates from Deepgram
 */
function handleTranscriptUpdate(transcriptData) {
  const { transcript, confidence, speakerId, isFinal } = transcriptData;
  
  if (transcript && isFinal) {
    // Map speaker ID to participant
    const participantId = mapSpeakerToParticipant(speakerId);
    const participant = participants.get(participantId);
    
    if (participant) {
      // Add new transcript
      participant.transcript += (participant.transcript ? ' ' : '') + transcript;
      participant.isSpeaking = true;
      participant.lastSpoke = new Date().toLocaleTimeString();
      participant.confidence = confidence;
      
      updateParticipantDisplay();
      
      // Stop speaking indicator after 3 seconds
      setTimeout(() => {
        participant.isSpeaking = false;
        updateParticipantDisplay();
      }, 3000);
    }
  }
}

/**
 * Map Deepgram speaker ID to participant ID
 */
function mapSpeakerToParticipant(speakerId) {
  // In a real implementation, you would maintain a mapping between
  // Deepgram speaker IDs and Meet participant IDs
  // For now, we'll use a simple mapping
  const speakerMapping = {
    0: 'user1',
    1: 'user2', 
    2: 'user3',
    3: 'user4'
  };
  
  return speakerMapping[speakerId] || 'user1';
}

/**
 * Show status message in side panel
 */
function showStatus(message, type = 'info') {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
  }
}

// Note: Initialization is now handled explicitly in the HTML files
// This ensures proper function calling as per Google Meet add-ons documentation

})();

transcriptAddon = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=bundle.js.map