import axios from 'axios';

const fetchPhoneticTranslation = async (languageCode, text) => {
    const response = await axios.post('/api/phonetic-translator', {languageCode, text});
    // Todo: handle errors
    return response.data;
}

export default fetchPhoneticTranslation;
