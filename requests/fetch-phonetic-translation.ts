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
    // Todo: handle errors
    const data = response.data;
    if (!data.translation.length || !["de", "en_UK", "fr_FR"].includes(languageCode))
        return data;
    return await getTranslationWithMlReplacements(signal, languageCode, data.translation)
}

export default fetchPhoneticTranslation;
