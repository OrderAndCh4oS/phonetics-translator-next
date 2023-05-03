import axios from 'axios';
import getTranslationWithMlReplacements from "../utilities/get-ml-translation";

export type Phonetics = {
    phonetics: string[]
    word: string
    type: 'rule' | 'lookup'
}

export type Char = {
    char: string
    type: 'char'
}

export type Transliteration = (Phonetics | Char)[]

const fetchPhoneticTranslation = async (signal: AbortSignal, languageCode: string, text: string): Promise<{
    translation: Transliteration
}> => {
    if (!text.length) return {translation: []};

    const response = await axios.post(
        '/api/phonetic-translator',
        {languageCode, text},
        {signal}
    );

    return response.data
}

export default fetchPhoneticTranslation;
