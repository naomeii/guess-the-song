const Word = ({ selectedWord, correctLetters }) => {
  
  return (
    <div className="word">
      {selectedWord.split('').map((letter, i) => {
        // Filter out apostrophes and spaces from the word
        if (letter === ' ' || letter === "'") {
          return <span className="special" key={i}>
            {letter}
          </span>;
        }

        return (
          <span className="letter" key={i}>
            {correctLetters.includes(letter) ? letter : ''}
          </span>
        );
      })}
    </div>
  );
};

export default Word;
