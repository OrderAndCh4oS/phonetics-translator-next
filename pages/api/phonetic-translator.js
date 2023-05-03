import {join} from 'path';
import {readFileSync} from 'fs';

function loadFile(file) {
    try {
        const dataDirectory = join(process.cwd(), 'data');
        let response = readFileSync(`${dataDirectory}/${file}`, {encoding: 'utf-8'});
        return response ? response : null;
    } catch (e) {
        console.log(e);
        return null;
    }
}

class BaseNode {
    _phonetics = new Set();

    get phonetics() {
        return this._phonetics;
    }

    _word = null;

    get word() {
        return this._word;
    }

    _type = 'rule';

    get type() {
        return this._type;
    }

    addPhonetic(phonetic) {
        this._phonetics.add(phonetic);
    }

    setWord(word) {
        this._word = word;
    }
}

class LookUpNode extends BaseNode {
    _type = 'lookup';

    constructor(char) {
        super()
        this._char = char;
    }

    _char;

    get char() {
        return this._char;
    }

    _nextLevel = {};

    get nextLevel() {
        return this._nextLevel;
    }
}

class Trie {
    _currentLanguageCode = null;
    _loadedDictionaries = {};

    constructor() {
    }

    get firstLevel() {
        return this._loadedDictionaries[this._currentLanguageCode];
    }

    addWord(word, phonetic) {
        const charsArr = word.split('');
        let currentLevel = this.firstLevel;
        let currentNode;
        let currentChar;
        do {
            currentChar = charsArr.shift();
            if (currentChar in currentLevel) {
                currentNode = currentLevel[currentChar];
                currentLevel = currentLevel[currentChar].nextLevel;
                continue;
            }
            currentLevel[currentChar] = new LookUpNode(currentChar);
            currentNode = currentLevel[currentChar];
            currentLevel = currentLevel[currentChar].nextLevel;
        } while (charsArr.length);
        const phoneticOptions = phonetic.split(', ');
        for (const phoneticOption of phoneticOptions) {
            currentNode.addPhonetic(phoneticOption);
        }
        currentNode.setWord(word);
    }

    hasDictionary(dictionary) {
        return Object.keys(this._loadedDictionaries).includes(dictionary);
    }
}

class TrieStepperAbstract extends Trie {
    _currentLevel = null;
    _lastNodeWithResult = null;
    _foundChars = false;
    _lastResultCursor = null;
    _currentNode = null;

    constructor() {
        super();
    }

    _cursor = 0;

    get cursor() {
        return this._cursor;
    }

    _result = [];

    get result() {
        return this._result.map(r =>
            r instanceof BaseNode
                ? {phonetics: [...r.phonetics], word: r.word, type: r.type}
                : {char: r, type: 'char'},
        );
    }

    _text = null;

    set text(text) {
        // Todo: remove need for extra spaces;
        this._text = typeof text === 'string' ? ' ' + text.toLowerCase() + ' ' : null;
    }

    translateText(text) {
        if (typeof text !== 'string') throw new Error('Text must be a string');
        this._text = ' ' + text.toLowerCase() + ' '; // Todo: remove need for spaces;
        this.run();
        return this.result;
    }

    reset() {
        this._currentLevel = this.firstLevel;
        this._lastNodeWithResult = null;
        this._foundChars = false;
    }

    clear() {
        this._currentLevel = this.firstLevel;
        this._lastNodeWithResult = null;
        this._lastResultCursor = null;
        this._currentNode = null;
        this._cursor = 0;
        this._result = [];
        this._text = null;
        this._foundChars = false;
    }

    isLetter(str) {
        return /\p{L}/u.test(str);
    }
}

class TrieWordStepper extends TrieStepperAbstract {
    _orthographyStepper = null;
    _currentWord = '';

    addOrthographyStepper(orthographyStepper) {
        this._orthographyStepper = orthographyStepper;
    }

    run() {
        if (typeof this._text !== 'string') throw new Error('Set some text before running');
        this._currentLevel = this.firstLevel;
        while (this._cursor < this._text.length) {
            const char = this._text[this._cursor];
            if (char in this._currentLevel &&
                (this._foundChars || !this.isLetter(this._text[this._cursor - 1]))) {
                this._foundChars = true;
                this._currentNode = this._currentLevel[char];
                this._currentLevel = this._currentNode.nextLevel;
                if (this._currentNode.word && !this.isLetter(this._text[this._cursor + 1])) {
                    this._lastNodeWithResult = this._currentNode;
                    this._lastResultCursor = this._cursor;
                }
                this._cursor++;
            } else if (this._lastNodeWithResult) {
                this._result.push(this._lastNodeWithResult);
                this._cursor = this._lastResultCursor + 1;
                this._lastAddedCursor = this._cursor;
                this.reset();
            } else {
                for (let i = this._lastAddedCursor; i <= this._cursor; i++) {
                    const char = this._text[i];
                    if (!this.isLetter(char)) {
                        this._result.push(char);
                        continue;
                    }
                    this._currentWord += char;
                    if (!this.isLetter(this._text[i + 1])) {
                        let phonetic = '';
                        if (this._orthographyStepper) {
                            phonetic = this._orthographyStepper
                                .translateText(this._currentWord);
                            this._orthographyStepper.clear();
                        }
                        const node = new BaseNode();
                        node.setWord(this._currentWord.trim())
                        node.addPhonetic('#' + phonetic.trim() + '#')
                        this._result.push(node);
                        this._currentWord = '';
                    }
                }
                this._lastAddedCursor = this._cursor + 1;
                this._cursor++;
                this.reset();
            }
        }
    }

    loadDictionary(dictionary) {
        this._currentLanguageCode = dictionary;
        if (this.hasDictionary(dictionary)) return;
        this._loadedDictionaries[dictionary] = {};
        const response = loadFile(`./combined-dictionaries/${dictionary}.txt`);
        const lines = response.split(/\r?\n/);
        for (const line of lines) {
            const [word, phonetic] = line.split(/\t/);
            if (!(word && phonetic)) continue;
            this.addWord(word.toLowerCase(), phonetic);
        }
    }
}

class TrieOrthographyStepper extends TrieStepperAbstract {
    _rulePreprocessors = {};
    _rulePostprocessors = {};

    constructor() {
        super();
    }

    get result() {
        let result = this._result.map(r =>
            r instanceof LookUpNode
                ? [...r.phonetics][0]
                : r,
        ).join('');
        if (this._currentLanguageCode in this._rulePreprocessors) {
            result = this._rulePostprocessors[this._currentLanguageCode].process(result);
        }
        return result;
    }

    addRulePreprocessorForLanguage(languageCode) {
        const ruleProcessor = new RuleProcessor();
        ruleProcessor.loadRuleFile(languageCode, 'preprocessor');
        this._rulePreprocessors[languageCode] = ruleProcessor;
    }

    addRulePostprocessorForLanguage(languageCode) {
        const ruleProcessor = new RuleProcessor();
        ruleProcessor.loadRuleFile(languageCode, 'postprocessor');
        this._rulePostprocessors[languageCode] = ruleProcessor;
    }

    run() {
        if (typeof this._text !== 'string') throw new Error('Set some text before running');
        if (this._currentLanguageCode in this._rulePreprocessors) {
            this._text = this._rulePreprocessors[this._currentLanguageCode].process(this._text);
        }
        this._currentLevel = this.firstLevel;
        while (this._cursor < this._text.length) {
            const char = this._text[this._cursor];
            if (char in this._currentLevel) {
                this._currentNode = this._currentLevel[char];
                this._currentLevel = this._currentNode.nextLevel;
                if (this._currentNode.word) {
                    this._lastNodeWithResult = this._currentNode;
                    this._lastResultCursor = this._cursor;
                }
                this._cursor++;
            } else if (this._lastNodeWithResult) {
                this._result.push(this._lastNodeWithResult);
                this._cursor = this._lastResultCursor + 1;
                this._lastAddedCursor = this._cursor;
                this.reset();
            } else {
                for (let i = this._lastAddedCursor || 0; i <= this._cursor; i++) {
                    this._result.push(this._text[i]);
                }
                this._lastAddedCursor = this._cursor + 1;
                this._cursor++;
                this.reset();
            }
        }
    }

    loadDictionary(dictionary) {
        this._currentLanguageCode = dictionary;
        if (this.hasDictionary(dictionary)) return;
        this._loadedDictionaries[dictionary] = {};
        const response = loadFile(`./processors/maps/${dictionary}.txt`);
        const lines = response ? response.split(/\r?\n/) : [];
        for (const line of lines) {
            const [word, phonetic] = line.split(/\t/);
            if (!(word && phonetic)) continue;
            this.addWord(word.toLowerCase(), phonetic);
        }
    }
}

class Rule {
    _toReplace = '';
    _replacement = '';
    _prefix = null;
    _suffix = null;

    constructor(rule, charGroups) {
        const [strings, match] = rule.split(/\s+\/\s+/u);
        [this._toReplace, this._replacement] = strings.split(/\s+->\s+/u);
        [this._prefix, this._suffix] = match.split(/\s?_\s?/u);
        for (const [key, value] of Object.entries(charGroups)) {
            const charGroupRegex = new RegExp(key, 'gu');
            this._prefix = this._prefix ? this._prefix.replace(charGroupRegex, value)
                .replace(/#/u, '^') : '';
            this._suffix = this._suffix ? this._suffix.replace(charGroupRegex, value)
                .replace(/#/u, '$') : '';
        }
        this._replacement = this._replacement.replace(/0/u, '');
    }

    get regex() {
        return new RegExp(`(${this._prefix})(${this._toReplace})(${this._suffix})`, 'ug');
    }

    apply(word) {
        return word.replace(this.regex, (_m, a, _b, c) => a + this._replacement + c);
    }
}

class RuleProcessor {
    _rules = [];

    loadRuleFile(languageCode, type) {
        const response = loadFile(`processors/rules/${type}s/${languageCode}.txt`);
        if (!response) return;
        const charGroupRegex = /^::\p{L}+?::\s+?=\s+?[\p{L}|]+/gmu;
        const ruleRegex = /^[\p{L}\[\]|]+?\s+->\s+[\p{L}\p{M}\[\]<>|0]+\s+\/\s+.*?$/gmu;
        const foundCharGroups = response.match(charGroupRegex);
        const charGroups = foundCharGroups
            ? foundCharGroups.reduce((obj, m) => {
                const [key, value] = m.split(/\s+=\s+/);
                return {...obj, [key]: value};
            }, {})
            : {};
        const rules = response.match(ruleRegex);
        this._rules = rules
            ? rules.map(r => new Rule(r, charGroups))
            : [];
    }

    process(word) {
        if (!this._rules.length) return word;
        return this._rules.reduce((w, r) => r.apply(w), word);
    }
}

const trieWord = new TrieWordStepper();
const trieOrthography = new TrieOrthographyStepper();

function translate(language, text) {
    trieWord.loadDictionary(language);
    trieOrthography.loadDictionary(language);
    trieOrthography.addRulePreprocessorForLanguage(language);
    trieOrthography.addRulePostprocessorForLanguage(language);
    trieWord.addOrthographyStepper(trieOrthography);
    const result = trieWord.translateText(text);
    trieWord.clear();
    return result;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405);
        return;
    }
    const errors = [];
    if (!req.body.languageCode) errors.push({languageCode: 'Missing field'});
    // Todo: ensure languageCode is valid.

    if (!req.body.text) errors.push({text: 'Missing field'});
    if (errors.length) return res.status(400).json(errors);
    if (!req.body.text.length) return res.status(200).json({transliteration: []});

    const translation = translate(req.body.languageCode, req.body.text);

    res.status(200).json({translation});
}
