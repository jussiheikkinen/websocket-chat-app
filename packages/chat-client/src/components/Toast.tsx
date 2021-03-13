import React from 'react'
import { Box } from '@chakra-ui/react'

interface Props {
  text: string | null
  title: string | null
}

function Toast({ text }: Props) {
  return (
    <Box
      style={{ padding: 16, borderRadius: 5 }}
      color='white'
      p={3}
      bg='green'
    >
      { text && text }
    </Box>
  )
}

export default Toast
