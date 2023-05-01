import axios from 'axios';

const fetchPhoneticTranslationMl = async (text) => {
    const response = await axios.post(
        `${process.env.NEXT_PUBLIC_TRANSLITERATOR_ML_API}`,
        {text}
    );
    // Todo: handle errors

    return response.data;
}

export default fetchPhoneticTranslationMl;
