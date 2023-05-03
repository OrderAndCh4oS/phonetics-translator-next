import fetchPhoneticTranslationMl from "../requests/fetch-phonetic-translation-ml";
import fetchPhoneticTranslation, {Transliteration} from "../requests/fetch-phonetic-translation";

const getTranslationWithMlReplacements = async (signal: AbortSignal, languageCode: string, text: string): Promise<{
    translation: Transliteration
}> => {
    const lookUpRes = await fetchPhoneticTranslation(signal, languageCode, text)
    if (!lookUpRes?.translation.length) return lookUpRes;

    const unmatchedText = lookUpRes.translation.reduce((arr, x) => {
        return x.type === 'rule' ? [...arr, x.word] : arr
    }, []).join(' ')

    if (!unmatchedText.length) return lookUpRes

    try {
        const mlRes = await fetchPhoneticTranslationMl(signal, languageCode, unmatchedText);
        const ipaArr = mlRes.ipa.split(' ');
        if (mlRes) {
            let i = 0;
            for (const x of lookUpRes.translation) {
                if (x.type === 'rule') {
                    x.phonetics.unshift(ipaArr[i]);
                    i++;
                }
            }
        }
    } catch(e) {
        console.error(e);
    }

    return lookUpRes;
};

export default getTranslationWithMlReplacements;
