const TransliteratorKey = () =>
    <div className={'my-10'}>
        <h3 className='font-bold'>Key</h3>
        <ul>
            <li>
                Non-highlighted text is a straight look up from an IPA dictionary for the chosen language
            </li>
            <li>
                <span className='text-blue-400'>Blue</span> highlighted text has alternate pronunciations,
                click on the text to view and select them.
            </li>
            <li>
                <span className='text-green-400'>Green</span> highlighted text has no dictionary look up and
                has used a machine learning model to generate the transliteration, quality of results will vary. An
                alternative transliteration created using phoneme rules may be available if the language supports them,
                otherwise the original word will be an option.
            </li>
        </ul>
    </div>

export default TransliteratorKey;
