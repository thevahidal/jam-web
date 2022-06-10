import { Group, Text, useMantineTheme, MantineTheme, Button } from '@mantine/core';
import { Upload, Photo, X, Icon as TablerIcon } from 'tabler-icons-react';
import { Dropzone, DropzoneStatus, IMAGE_MIME_TYPE, MIME_TYPES } from '@mantine/dropzone';
import { useRef, useState } from 'react';

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
  console.log(status)
  return status.accepted
    ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
    : status.rejected
      ? theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]
      : theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7];
}

function UploadIcon({
  status,
  ...props
}: React.ComponentProps<TablerIcon> & { status: DropzoneStatus }) {
  if (status.accepted) {
    return <Upload {...props} />;
  }

  if (status.rejected) {
    return <X {...props} />;
  }

  return <Photo {...props} />;
}

export const dropzoneChildren = (status: DropzoneStatus, theme: MantineTheme) => (
  <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
    <UploadIcon status={status} style={{ color: getIconColor(status, theme) }} size={80} />

    <div>
      <Text size="xl" inline>
        Drag videos here or click to select files
      </Text>
      <Text size="sm" color="dimmed" inline mt={7}>
        Make sure the file does not exceed 5mb
      </Text>
    </div>
  </Group>
);


export const errorMessage = (rejected, theme: MantineTheme) => (
  <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
    <UploadIcon status={{ rejected: true, accepted: false }} style={{ color: getIconColor({ rejected: true, accepted: false }, theme) }} size={80} />

    <div>
      <Text size="xl" inline>
        This file is not supported
      </Text>
      <Text size="sm" color="dimmed" inline mt={7}>
        <strong>{rejected.map(r => r.file.name)}</strong> could not be uploaded.
      </Text>
    </div>
  </Group>
);



export default (props) => {
  const [rejected, setRejected] = useState([])
  const theme = useMantineTheme();
  const openRef = useRef<() => void>();

  const handleReject = (files) => {
    setRejected(files)
  }

  const handleDrop = (files) => {
    setRejected([])
    if (!props.onAccept) return
    props.onAccept(files)
  }

  const isRejected = rejected.length > 0
  return (
    <>
      <Dropzone
        openRef={openRef}
        onDrop={handleDrop}
        onReject={handleReject}
        maxSize={3 * 1024 ** 2}
        accept={[MIME_TYPES.mp4, "avi"]}
        multiple={false}
      >
        {(status) =>
          !isRejected
            ? dropzoneChildren(status, theme)
            : errorMessage(rejected, theme)
        }
      </Dropzone>

      <Group position="center" mt="md">
        <Button onClick={() => openRef.current()}>Select {isRejected ? "other" : ""} files</Button>
      </Group>
    </>
  );
}

