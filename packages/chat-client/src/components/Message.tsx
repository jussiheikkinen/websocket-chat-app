import React from 'react'
import {
  Box,
  Text,
  Heading
} from '@chakra-ui/react'

function Message({ title, desc, ...rest }: any ) {
  return (
    <Box
      p={2}
      shadow='md'
      borderWidth='1px'
      flex='1'
      borderRadius='md'
      {...rest}
    >
      <Heading align='left' color='#000' fontSize='sm'>{title}</Heading>
      <Text color='#000' mt={4} fontSize='md'>{desc}</Text>
    </Box>
  )
}

export default Message
