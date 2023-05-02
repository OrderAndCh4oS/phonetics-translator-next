const TransliteratorKey = () =>
    <div className={'my-10'}>
        <h3 className='font-bold'>Key</h3>
        <ul>
            <li>
                <span className='text-blue-400'>Blue</span> highlighted text has alternate pronunciations,
                click on the text to view and select them.
            </li>
            <li>
                <span className='text-red-400'>Red</span> highlighted text has no dictionary look up and may
                have been transliterated using phoneme rules, provided such rules are available for the
                particular language.
            </li>
            <li>
                <span className='text-green-400'>Green</span> highlighted text has no dictionary look up and
                has used a machine learning model to generate the transliteration, results may vary. An alternative
                transliteration created using phoneme rules may be available if the language supports them.
            </li>
        </ul>
    </div>

export default TransliteratorKey;
