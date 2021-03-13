import React from 'react'
import {
  Box,
  Text,
  Heading,
  Badge
} from '@chakra-ui/react'
import dayjs from 'dayjs'

function Message({ title, desc, timestamp, sentByMe, ...rest }: any ) {
  return (
    <Box
      p={2}
      shadow='md'
      borderWidth='1px'
      flex='1'
      borderRadius='md'
      style={{...sentByMe && { background: '#EEE' }}}
      {...rest}
    >
      <Heading align='left' color='#000' fontSize='sm'>
        {sentByMe &&
          <Badge colorScheme='purple' variant='subtle' style={{ marginRight: 8 }}>
            You
          </Badge>
        }
        {`${title} - ${dayjs(timestamp).format('YYYY-MM-DD HH:mm')}`}
      </Heading>
      <Text color='#000' mt={4} fontSize='md'>{desc}</Text>
    </Box>
  )
}

export default Message
