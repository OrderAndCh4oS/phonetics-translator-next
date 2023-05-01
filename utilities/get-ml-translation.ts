import fetchPhoneticTranslationMl from "../requests/fetch-phonetic-translation-ml";

const getTranslationWithMlReplacements = async (translation: string[][]) => {
    const text = translation.reduce((arr, wordSet) => {
        const str = wordSet[0];
        return str.length && str[0] === '#' && str.at(-1) === '#' ? [...arr, str.slice(1, -1)] : arr
    }, []).join(' ')

    try {
        const res = await fetchPhoneticTranslationMl(text)
        const ipaArr = res.ipa.split(' ');
        if (res) {
            let i = 0;
            for (const wordSet of translation) {
                const str = wordSet[0];
                if(str.length && str[0] === '#' && str.at(-1) === '#') {
                    wordSet.unshift(ipaArr[i]);
                    i++;
                }
            }
        }

        return {translation};
    } catch (e) {
        console.log('Error')
        // Todo: display error
        console.error(e);
    }
};

export default getTranslationWithMlReplacements;
