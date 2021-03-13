import React, { useState } from 'react'
import {
  Button,
  Modal,
  Input,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'

interface Props {
  onSubmit: any
}

function JoinRoomDlg({ onSubmit }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [roomId, setRoomId] = useState('')

  return (
    <>
      <Button onClick={onOpen}>Join chat</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Join to a chat room</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              onChange={event => setRoomId(event.target.value)}
              placeholder='Room identifier'
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme='red'
              variant='outline'
              mr={3}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              colorScheme='teal'
              variant='solid'
              onClick={() => roomId.length && onSubmit(roomId)}
            >
              Join
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default JoinRoomDlg
