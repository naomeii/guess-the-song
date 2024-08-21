import { useState, useEffect } from 'react';
import axios from 'axios';

// import Header from './components/Header';
import Figure from './components/Figure';
import WrongLetters from './components/WrongLetters';
import Word from './components/Word';
import Popup from './components/Popup';
import Notification from './components/Notification';
import { showNotification as show } from './helpers/helpers';

import './App.css';

function App() {

  const CLIENT_ID = "358bd2dd94e741ef857cf23a3c356dd9"
  const REDIRECT_URI = "http://localhost:5173"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState('')
  const [searchKey, setSearchKey] = useState('')

  const [artistName, setArtistName] = useState('')
  const [trackList, setTrackList] = useState('')
  const [chosenTrack, setChosenTrack] = useState(null)

  const [lyrics, setLyrics] = useState('')
  const [randomLyrics, setRandomLyrics] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const hash = window.location.hash // the URL
    let token = window.localStorage.getItem('token') // retrieve token from LS

    // if no token from LS and we have a hash
    if (!token && hash) {
      // split hash to retrieve token
      token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split("=")[1]
      // console.log(token)
      window.location.hash = ''
      window.localStorage.setItem('token', token);
    }

    setToken(token);

  }, [])

  const handleLogout = () => {
    setToken('');
    window.localStorage.removeItem('token');
  }

  const searchArtists = async (e) => {
    e.preventDefault()
    // reset error msg
    setErrorMessage('')

    // requests
    const {data} = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: 'artist'
      }
    })

    const artistObj = data.artists.items[0]
    setArtistName(artistObj.name)

    const artistTopTracks = await axios.get(`https://api.spotify.com/v1/artists/${artistObj.id}/top-tracks`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    })

    getRandomTrack(artistTopTracks.data.tracks)
  }

  const getRandomTrack = (artistTracksList) => {
    setTrackList(artistTracksList)

    const randomTrack = Math.floor(Math.random() * artistTracksList.length)
    const selectedTrack = artistTracksList[randomTrack]

    const name = trackNameAndFeature(selectedTrack.name)

    const createdTrack = {
      name,
      releaseDate: selectedTrack.album.release_date
    }

    setChosenTrack(createdTrack)
  }

  const trackNameAndFeature = (str) => {
    const openParenthesesIndex = str.indexOf('(');
    const closeParenthesesIndex = str.indexOf(')');

    if (openParenthesesIndex === -1 || closeParenthesesIndex === -1) {
        // doesn't include a feature
        return {
            title: str,
            feature: ''
        };
    }

    // text outside parentheses
    const title = str.slice(0, openParenthesesIndex).trim() + str.slice(closeParenthesesIndex + 1).trim();
    // text inside parentheses
    const feature = str.slice(openParenthesesIndex + 1, closeParenthesesIndex).trim();

    return {
      title,
      feature
    };
  }

  const getLyrics = async () => {
    if (!artistName === '' || !chosenTrack.name.title === ''){
      return;
    }

    setLyrics('')

    try {
      const response = await axios.get(`https://api.lyrics.ovh/v1/${artistName}/${chosenTrack.name.title}`)
      // console.log(response.data.lyrics)
      setLyrics(response.data.lyrics)
    } catch (err) {
      console.error(err);
      setErrorMessage('Something went wrong. Please search again.')
      setLyrics('')
    }
  }

  const generateRandomLyrics = (numLines = 3) => {
    // remove carriage returns and split lyrics string into an array of lines
    const lines = lyrics
    .replace(/\r/g, '') // remove carriage returns
    .split('\n') // split by new line
    .map(line => line.trim()) // trim each line
    .filter(line => line !== '' && 
                    !line.startsWith('Paroles de la chanson') && 
                    !line.includes('[') && 
                    !line.includes(']')); 
    // randomly select a starting index for the consecutive lines
    const startIndex = Math.floor(Math.random() * (lines.length - numLines + 1));

    // get 3 lines
    const randomLines = lines.slice(startIndex, startIndex + numLines);

    setRandomLyrics(randomLines);
    // return randomLines;
  }

  // allows u to use track immediately after using setTrack
   useEffect(() => {
    if (chosenTrack && artistName && trackList){
      console.log('track title: ', chosenTrack.name.title)
      getLyrics()
      // getRandomTrack(trackList);
    }
  }, [chosenTrack, artistName, trackList]) // dependency array

  // rerender when lyrics value was set
  useEffect(() => {
    if (lyrics !== '') {
      generateRandomLyrics();
    }
  }, [lyrics]);


  // rerender when randomLyrics value was set
  useEffect(() => {
    if (randomLyrics) {
      console.log('random lyrics: ', randomLyrics);
    }
  }, [randomLyrics]);

  //////////////////////

  const [playable, setPlayable] = useState(true);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleKeydown = event => {
      const { key, keyCode } = event;

      const letter = key.toLowerCase();

      // Alphanumeric keycodes: 65-90 (A-Z), 97-122 (a-z), 48-57 (0-9)
      const isAlphanumeric = (keyCode >= 65 && keyCode <= 90) || 
                             (keyCode >= 97 && keyCode <= 122) || 
                             (keyCode >= 48 && keyCode <= 57);
  
      if (!chosenTrack || !isAlphanumeric) {
        // If no track is chosen or the key is not alphanumeric, ignore the key press
        return;
      }
  
      // Convert letter to lowercase to match the answer format
      const answer = chosenTrack.name.title.toLowerCase().trim();
  
      // Ensure the keyCode is between 65 and 90 (A-Z)
      if (playable) {
          
        // Letter is part of the answer
        if (answer.includes(letter)) {
          // add to array of correct letters
          if (!correctLetters.includes(letter)) {
            setCorrectLetters(currentLetters => [...currentLetters, letter]);
            console.log('correct letters: ', correctLetters)

          } else {
            show(setShowNotification); // we have alr entered the letter
          }
        } else {
          // Letter is not part of the answer
          if (!wrongLetters.includes(letter)) {
            console.log('wrong letters: ', wrongLetters)
            setWrongLetters(currentLetters => [...currentLetters, letter]);
          } else {
            show(setShowNotification);
          }
        }
      }
    };
  
    // Add event listener for keydown
    window.addEventListener('keydown', handleKeydown);
  
    // Cleanup: remove event listener when the component unmounts or dependencies change
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [chosenTrack, correctLetters, wrongLetters, playable]);


  const playAgain = () => {
    setPlayable(true);
    // reset states
    setCorrectLetters([]);
    setWrongLetters([]);

    // get random track from trackList
    getRandomTrack(trackList);

  }

  return (
    <>
      {/* <Header /> */}
      <h2>Guess the Song!</h2>
        {
        !token ? 
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
         : 

         <>
          <button onClick={handleLogout}>Logout</button>

          {
            !artistName ? 
            <form onSubmit={searchArtists}>
                <input type="text" onChange={e => setSearchKey(e.target.value)} />
                <button type="submit">Search</button>
            </form>
            :
            <></>
          }

          {
              errorMessage ? (
                <p>
                {
                  !artistName ? 
                  <form onSubmit={searchArtists}>
                      <input type="text" onChange={e => setSearchKey(e.target.value)} />
                      <button type="submit">Search</button>
                  </form>
                  :
                  <></>
                }
                  {errorMessage}
                </p>
              ) : (
                <>
                  <pre>
                    {randomLyrics !== '' && randomLyrics.join('\n')}
                  </pre>
                  <p>
                    {chosenTrack && chosenTrack.name.feature && `Hint: ${chosenTrack.name.feature}`}
                    {chosenTrack && chosenTrack.name.feature && <br />}
                    {chosenTrack && `Release date: ${chosenTrack.releaseDate}`}
                  </p>
                </>
              )
            }
         </>
        }

        {artistName !== '' && chosenTrack &&
        <>
          <div className="game-container">
          <Figure wrongLetters={wrongLetters} />
          <WrongLetters wrongLetters={wrongLetters} />
          <Word selectedWord={chosenTrack.name.title.toLowerCase()} correctLetters={correctLetters} />
          </div>
          <Popup correctLetters={correctLetters} wrongLetters={wrongLetters} selectedWord={chosenTrack.name.title.toLowerCase()} setPlayable={setPlayable} playAgain={playAgain} />
          <Notification showNotification={showNotification} />
        </>
        }
    </>
  );
}

export default App;