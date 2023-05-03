import React, {FC, useRef, useState} from "react";
import useOnClickOutside from "../hooks/use-on-click-outside";
import {Phonetics} from "../requests/fetch-phonetic-translation";

const SelectWord: FC<{ phonetics: Phonetics, wordId: string, colour: string }> = (
    {
        phonetics,
        wordId,
        colour
    }
) => {
    const [selectedWordIndex, setSelectedWordIndex] = useState(0)
    const [showWordChoices, setShowWordChoices] = useState(false)
    const ref = useRef(null)

    const toggleWordChoices = () => {
        setShowWordChoices(prevState => !prevState);
    };

    const handleSelectWord = (i: number) => () => {
        setSelectedWordIndex(i);
        setShowWordChoices(false);
    };

    const handleClickOutside = () => {
        setShowWordChoices(false);
    };

    useOnClickOutside(ref, handleClickOutside)

    return (
        <div className='inline relative' ref={ref}>
            <button onClick={toggleWordChoices}
                    className={`${colour} font-bold`}>{phonetics.phonetics[selectedWordIndex]}</button>
            {showWordChoices
                ? (
                    <div className='absolute w-auto top-5 left-0 bg-gray-200 shadow z-10'>
                        {phonetics.phonetics.map((word, i) =>
                            <button
                                key={`${wordId}_${word}`}
                                onClick={handleSelectWord(i)}
                                className='whitespace-nowrap bg-gray-200 block w-auto min-w-full p-1 border-b border-b-gray-300 hover:bg-gray-400 last-of-type:border-0'
                            >
                                {word}
                            </button>
                        )}
                    </div>
                )
                : null}
        </div>
    );
};

export default SelectWord;
