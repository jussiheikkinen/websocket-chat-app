import React, { useEffect, useState, useRef } from 'react'
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  Button,
  Flex,
  Textarea
} from '@chakra-ui/react'
import { ColorModeSwitcher } from './ColorModeSwitcher'

//const ws = new WebSocket('ws://localhost:8080')
const ws = new WebSocket('ws://localhost:8080')

export const App = () => {
  const [joined, setJoined] = useState<Boolean>(false)
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<string[]>([])
  const feedRef = useRef<any>(null)

  useEffect(() => {
    ws.onopen = () => {
      console.log('Websocket client connected')
      setJoined(true)
    }

    ws.onmessage = (data) => {
      console.log('received', data)
      setMessages([...messages, data.data])
      feedRef.current.scrollIntoView({behavior: 'smooth', block: 'end'})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  const submit = () => {
    if (!joined) return

    console.log(input)
    ws.send(input)
    setInput('')
  }

  const leave = () => {
    fetch('http://localhost:8080/logout', {
      method: 'DELETE',
      //credentials: 'same-origin',
      credentials: 'include',
      body: JSON.stringify('masamainio'),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(res => {
      console.log(res)
      setJoined(false)
    })
    .catch(err => console.error(err))
  }

  const login = () => {
    fetch('http://localhost:8080/login', {
      method: 'POST',
      //credentials: 'same-origin',
      credentials: 'include',
      body: JSON.stringify('masamainio'),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(res => {
      console.log(res)
      setJoined(true)
    })
    .catch(err => console.error(err))
  }

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign='center' fontSize='xl'>
        <Grid minH='100vh' p={3}>
          <ColorModeSwitcher justifySelf='flex-end' />
          <Button
            style={{ position: 'fixed', width: 100 }}
            onClick={() => !joined ? login() : leave()}
            colorScheme='blue'
          >
            {!joined ? 'Join' : 'Leave'}
          </Button>
          <Box
            style={{
              width: '100%',
              position: 'fixed',
              overflowY: 'scroll',
              bottom: 200,
              top: 100,
              right: 10,
              left: 10
            }}
          >
            <Flex
              direction={'column'}
              justify='center'
              align='center'
              ref={feedRef}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    width: '90%',
                    height: '5lh',
                    background: '#FFF',
                    borderRadius: 5,
                    margin: '8px auto'
                  }}
                >
                  <p style={{ color: '#000' }}>{msg}</p>)
                </div>
              ))}
            </Flex>
          </Box>
          <Flex
            direction={'column'}
            justify='center'
            align='center'
            style={{ position: 'fixed', bottom: 20, left: 0, right: 0 }}
          >
            <Textarea
              //onKeyUp={event => event.keyCode === 13}
              value={input}
              onChange={event => setInput(event.target.value)}
              style={{ background: '#FFF', color: '#000', width: '90vw' }}
              placeholder='Here is a sample placeholder'
            />
            <Button
              onClick={() => submit()}
              style={{ width: 100, margin: 8 }}
              >
              Send
            </Button>
          </Flex>
        </Grid>
      </Box>
    </ChakraProvider>
  )
}
