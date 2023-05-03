import fetchPhoneticTranslationMl from "../requests/fetch-phonetic-translation-ml";
import {Transliteration} from "../requests/fetch-phonetic-translation";

const getTranslationWithMlReplacements = async (signal: AbortSignal, languageCode: string, translation: Transliteration) => {
    const text = translation.reduce((arr, x) => {
        return x.type === 'rule' ? [...arr, x.word] : arr
    }, []).join(' ')

    try {
        const res = await fetchPhoneticTranslationMl(signal, languageCode, text)
        const ipaArr = res.ipa.split(' ');
        if (res) {
            let i = 0;
            for (const x of translation) {
                if(x.type === 'rule') {
                    x.phonetics.unshift(ipaArr[i]);
                    i++;
                }
            }
        }

        return {translation};
    } catch (e) {
        console.log('Error')
        // Todo: display error
        console.error(e);
        return {translation}
    }
};

export default getTranslationWithMlReplacements;
