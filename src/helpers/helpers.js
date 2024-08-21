export function showNotification(setter) {
    setter(true);
    setTimeout(() => {
      setter(false);
    }, 2000);
  }
  
  export function checkWin(correct, wrong, word) {
    let status = 'win';

    // console.log('correct:', correct)
    // console.log('wrong:', wrong)
    // console.log('word:', word)

    // Check for win
    word.split('').forEach(letter => {
      // skip spaces and apostrophes
      if (letter !== ' ' && letter !== '\'' && !correct.includes(letter)) {
        status = '';
      }
    });
    
    // Check for lose
    if(wrong.length === 6) status = 'lose';

    // console.log('status:', status)
  
    return status
  }