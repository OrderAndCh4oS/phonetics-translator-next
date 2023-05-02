import axios from 'axios';

const fetchPhoneticTranslationMl = async (languageCode: string, text: string): Promise<{ ipa: string }> => {
    const response = await axios.post(
        `${process.env.NEXT_PUBLIC_TRANSLITERATOR_ML_API}`,
        {text, language_code: languageCode}
    );

    return response.data;
}

export default fetchPhoneticTranslationMl;
