const Word = ({ selectedWord, correctLetters }) => {

  const typeableChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  return (
    <div className="word">
      {selectedWord.split('').map((letter, i) => {
        // Filter out special chars
        if (!typeableChars.includes(letter)) {
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
