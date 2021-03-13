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
  HStack,
  useToast
} from '@chakra-ui/react'
import { FaRegCopy } from 'react-icons/fa'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import MessageRow from './components/Message'
import JoinRoomDlg from './components/JoinRoomDlg'


interface MessageResponse {
  data: string
}

interface Message {
  message: string,
  user: string,
  username: string,
  timestamp: number,
  sentByMe: boolean
}

interface Session {
  room: string
  username: string
}

const ip = '192.168.1.104'

export const App = () => {
  const [ws, setWs] = useState<any>(null)
  const [joined, setJoined] = useState<Boolean>(false)
  const [session, setSession] = useState<Session | null>(null)
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const feedRef = useRef<any>(null)
  const toast = useToast()

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
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(res => {
      console.log(res)
      setJoined(false)
      setSession(null)
      setMessages([])
      setWs(null)
    })
    .catch(err => console.error(err))
  }

  const login = (roomId: string) => {
    fetch(`http://${ip}:8080/login/${roomId}`, {
      method: 'POST',
      //credentials: 'same-origin',
      credentials: 'include',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(res => {
      console.log(res)
      if (!res.error) {
        setJoined(true)
        setSession(res)
        toast({
          title: 'Great',
          description: 'Joined to chat',
          status: 'success',
          duration: 2000,
        })
      } else {
        toast({
          title: 'Oops',
          description: 'Could not join room',
          status: 'error',
          duration: 2000,
        })
      }
    })
    .catch(err => console.error(err))
  }

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign='center' fontSize='xl'>
        <Grid minH='100vh' p={3}>
          <ColorModeSwitcher justifySelf='flex-end' />
          {!joined &&
            <HStack style={{ position: 'fixed' }}>
              <JoinRoomDlg onSubmit={(id: string) => login(id)} />
              <Button colorScheme='teal' onClick={() => login('new')}>
                New chat
              </Button>
            </HStack>
          }
          {joined &&
            <HStack style={{ position: 'fixed' }}>
              <Button colorScheme='red' onClick={() => leave()}>
                Leave room
              </Button>
              <CopyToClipboard
                text={session ? session.room : ''}
                onCopy={() => toast({ title: 'Link copied', status: 'info', duration: 1000 })}
              >
                <Button rightIcon={<FaRegCopy/>}>
                  Copy room name
                </Button>
              </CopyToClipboard>
            </HStack>
          }
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
              {messages.map(({ message, username, timestamp, sentByMe }, i) => (
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
                  <MessageRow
                    title={username}
                    desc={message}
                    timestamp={timestamp}
                    sentByMe={sentByMe}
                  />
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
              disabled={!joined}
              value={input}
              onChange={event => setInput(event.target.value)}
              style={{ background: '#FFF', color: '#000', width: '90vw' }}
              placeholder='Here is a sample placeholder'
            />
            <Button
              disabled={!joined}
              variant='outline'
              colorScheme='teal'
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
