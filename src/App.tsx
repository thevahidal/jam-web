import { useEffect, useMemo, useState } from 'react'
import {
  Box, Button, Container, Divider, Title, createStyles, Grid,
  Card, Group, Image, Text, Badge, useMantineTheme, Slider, AppShell, Navbar, Header,
  useMantineColorScheme, ActionIcon, Modal, AspectRatio, Overlay
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { Sun, Moon } from 'tabler-icons-react';
import axios from 'axios'
import { useQuery } from 'react-query';
import { useSpring, animated } from '@react-spring/web'
import { useDrag, useGesture } from '@use-gesture/react'

import Dropzone from './components/new-jam/dropzone';

const useStyles = createStyles((theme) => ({
  navbar: {

  },
  body: {

  }
}));

function App() {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <>
      <AppShell
        padding="md"
        header={<Header height={90} p={'xl'}>
          <Box className={classes.navbar}>
            <Container>
              <Group>
                <Text weight={'bolder'} size='lg'>
                  Jam
                </Text>
                <ActionIcon
                  onClick={() => toggleColorScheme()}
                  variant='filled'
                  color={'dark'}
                >
                  {colorScheme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                </ActionIcon>
              </Group>
            </Container>
          </Box>
        </Header>}
        styles={(theme) => ({
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
        })}
      >
        <AppChildren />
      </AppShell>

    </>
  )
}

export default App


const JamCard = props => {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  const secondaryColor = theme.colorScheme === 'dark'
    ? theme.colors.dark[1]
    : theme.colors.gray[7];

  return (

    <Card shadow="sm" p="lg" mb={"lg"}>
      <Card.Section>
        <Image src={props.image} height={400} alt="Norway" />
      </Card.Section>

      <Group position="apart" style={{ marginBottom: 5, marginTop: theme.spacing.sm }}>
        <Text weight={500}>{props.title}</Text>
      </Group>

      <Text size="sm" style={{ color: secondaryColor, lineHeight: 1.5 }}>
        {props.description}
      </Text>

      <Button variant="light" color="blue" fullWidth style={{ marginTop: 14 }}>
        Book classic tour now
      </Button>
    </Card>
  )
}


const CREATE_JAM_STEPS = {
  file: 1,
  crop: 2,
  edit: 3,
}

const DraggingOverlay = props => {
  return (
    <div style={{
      background: 'red',
    }} />
  )
}

function clamp(number: number, min: number, max: number): number {
  return Math.min(Math.max(number, min), max);
}

const CropVideo = props => {
  const [isDragging, setIsDragging] = useState(false)
  const [videoSrc, setVideoSrc] = useState(URL.createObjectURL(props.file))
  const { ref, width, height } = useElementSize();
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))
  const [movement, setMovement] = useState([0, 0])

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my] }) => {
      api.start({ x: down ? mx : 0, y: down ? my : 0, immediate: down })
    },
    onDragStart: ({ event, ...sharedState }) => setIsDragging(true),
    onDragEnd: ({ event, movement, ...sharedState }) => {
      setIsDragging(false)
      setMovement(prevMovement => {
        const xAxisMovement = clamp(prevMovement[0] + movement[0], -1 * width, 0)
        const yAxisMovement = clamp(prevMovement[1] + movement[1], -1 * height, 0)

        return ([xAxisMovement, yAxisMovement])
      })

    }
  })

  return (
    <div>
      <div ref={ref} style={{background: 'red', width: '100%', height: 1}}></div>
      <Box
        sx={{ position: 'relative', overflow: 'hidden' }}
      >
        {isDragging && <Overlay opacity={0.2} color="#000" zIndex={5} />}
        <animated.video src={videoSrc} {...bind()} style={{ x, y, marginLeft: movement[0] }} height={width}></animated.video>
      </Box>
    </div>
  )
}

const NewJam = props => {
  const [opened, setOpened] = useState(false);
  const [step, setStep] = useState(CREATE_JAM_STEPS.file)
  const [files, setFiles] = useState([])

  const handleAcceptFiles = (files) => {
    setStep(CREATE_JAM_STEPS.crop)
    setFiles(files)
  }

  const renderChildren = () => {
    switch (step) {
      case CREATE_JAM_STEPS.file:
        return <Dropzone
          onAccept={handleAcceptFiles}
        />
      case CREATE_JAM_STEPS.crop:
        return <CropVideo file={files[0]} />
      default:
        return <div />
    }
  }

  const handleCloseModal = () => {
    setOpened(false)
    setStep(CREATE_JAM_STEPS.file)
    setFiles([])
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title="Create new Jam"
        size={'lg'}
      >
        {renderChildren()}
        <Button
          onClick={() => setOpened(true)}
          mt={'lg'}
        >Next</Button>
      </Modal>


      <Card>
        <Text
          weight={500}
        >
          Start a new Jam
        </Text>
        <Text size="sm">
          Initiate a Jam to attract like-minded fellows to join you on creating a awesome video.
        </Text>
        <Button
          onClick={() => setOpened(true)}
          mt={'lg'}
        >Let's Go</Button>
      </Card>
    </>
  )
}


const AppChildren = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  const { isLoading, error, data: jams } = useQuery('jamData', () =>
    axios.get('https://api.sampleapis.com/coffee/hot')
  )

  if (isLoading) return 'Loading...'
  if (error) return 'An error has occurred: ' + error.message

  return (
    <>
      <Box py={'xl'} className={classes.body}>
        <Container>
          <Grid>
            <Grid.Col span={8}>
              {
                jams.data.map(jam => <JamCard key={jam.id} {...jam} />)
              }
            </Grid.Col>
            <Grid.Col span={4}>
              <NewJam />
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
    </>
  )
}