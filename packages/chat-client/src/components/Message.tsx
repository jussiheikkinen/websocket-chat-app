import React from 'react'
import {
  Box,
  Text,
  Heading
} from '@chakra-ui/react'
import dayjs from 'dayjs'

function Message({ title, desc, timestamp, ...rest }: any ) {
  return (
    <Box
      p={2}
      shadow='md'
      borderWidth='1px'
      flex='1'
      borderRadius='md'
      {...rest}
    >
      <Heading align='left' color='#000' fontSize='sm'>
        {`${title} - ${dayjs(timestamp).format('YYYY-MM-DD HH:mm')}`}
      </Heading>
      <Text color='#000' mt={4} fontSize='md'>{desc}</Text>
    </Box>
  )
}

export default Message
