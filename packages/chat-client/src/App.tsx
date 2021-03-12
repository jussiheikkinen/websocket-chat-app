import React, { useEffect, useState, useRef } from 'react'
import {
  ChakraProvider,
  Box,
  Grid,
  theme,
  Button,
  Flex,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import Message from './components/Message'


interface MessageResponse {
  data: string
}

interface Message {
  message: string,
  user: string
}

const ip = '192.168.1.104'

export const App = () => {
  const [ws, setWs] = useState<any>(null)
  const [joined, setJoined] = useState<Boolean>(false)
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const feedRef = useRef<any>(null)

  useEffect(() => {
    if (ws === null) {
      setWs(new WebSocket(`ws://${ip}:8080`))
    }

    return () => ws && ws.close()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined])

  useEffect(() => {
    if (!ws) return

    ws.onopen = () => {
      console.log('Websocket client connected')
      setJoined(true)
    }

    ws.onmessage = ({ data }: MessageResponse) => {
      console.log('received', JSON.parse(data))
      setMessages([...messages, JSON.parse(data)])
      feedRef.current.scrollIntoView({behavior: 'smooth', block: 'end'})
    }

    ws.onerror = (event: any) => {
      console.error('WebSocket error observed:', event)
      setWs(null)
    }

    ws.onclose = () => {
      console.log('Closing ws connection')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  const submit = () => {
    if (!joined) return

    console.log(input)
    ws.send(input)
    setInput('')
  }

  const leave = () => {
    fetch(`http://${ip}:8080/logout`, {
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
      setWs(null)
    })
    .catch(err => console.error(err))
  }

  const login = () => {
    fetch(`http://${ip}:8080/login`, {
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
            <VStack ref={feedRef}>
              {messages.map(({ message, user }, i) => (
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
                  <Message title={user} desc={message} />
                </div>
              ))}
            </VStack>
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
              style={{ width: 500, margin: 16 }}
              >
              Send
            </Button>
          </Flex>
        </Grid>
      </Box>
    </ChakraProvider>
  )
}
