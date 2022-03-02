import {View, Text, Button, Image, NativeModules} from 'react-native';
import React, {useEffect, useState} from 'react';
import * as ImagePicker from 'react-native-image-picker';
import {createThumbnail} from 'react-native-create-thumbnail';
const RNFS = require('react-native-fs');
//const prettyBytes = require('pretty-bytes');
import prettyBytes from 'pretty-bytes';
const {Compressor} = NativeModules;
import {Video, getRealPath} from 'react-native-compressor';

// export const getRealPath = (path, type) => {
//   return Compressor.getRealPath(path, type);
// };
export const getFileInfo = RNFS.stat;
export default function App() {
  const [sourceVideo, setSourceVideo] = useState();
  const [sourceSize, setSourceSize] = useState();
  const [sourceVideoThumbnail, setSourceVideoThumbnail] = useState();
  const [compressedSize, setCompressedSize] = useState();
  const [compressedVideoThumbnail, setcompressedVideoThumbnail] = useState();
  const [compressedUploadProgress, setCompressedUploadProgress] = useState(0);
  const [compressedVideo, setCompressedVideo] = useState();
  const [compressingProgress, setCompressingProgress] = useState(0);
  const [sourceUploadProgress, setSourceUploadProgress] = useState(0);
  // const [compressedUploadProgress, setCompressedUploadProgress] =

  useEffect(() => {
    if (!sourceVideo) return;
    createThumbnail({
      url: sourceVideo,
    })
      .then(response => setSourceVideoThumbnail(response.path))
      .catch(error => console.log({error}));
    (async () => {
      const detail = await getFileInfo(sourceVideo);
      console.log(detail);
      setSourceSize(prettyBytes(parseInt(detail.size)));
    })();
  }, [sourceVideo]);
  useEffect(() => {
    if (!compressedVideo) return;
    setcompressedVideoThumbnail(sourceVideoThumbnail);
    createThumbnail({
      url: compressedVideo,
    })
      .then(response => setcompressedVideoThumbnail(response.path))
      .catch(error => {
        console.log({errorThumnail: error});
        setcompressedVideoThumbnail(sourceVideoThumbnail);
      });

    (async () => {
      const detail = await getFileInfo(compressedVideo);
      setCompressedSize(prettyBytes(parseInt(detail.size)));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compressedVideo]);
  const selectVideo = async () => {
    try {
      ImagePicker.launchImageLibrary(
        {
          mediaType: 'video',
        },
        async result => {
          if (result.didCancel) {
          } else if (result.errorCode) {
            Alert.alert('Failed selecting video');
          } else {
            if (result.assets) {
              const source = result.assets[0];
              let uri = source.uri;
              console.log(uri);
              if (Platform.OS === 'android' && uri.includes('content://')) {
                const realPath = await getRealPath(uri, 'video');
                console.log('old path==>', uri, 'realPath ==>', realPath);
              }
              setSourceVideo(uri);
            }
          }
        },
      );
    } catch (error) {
      console.log('Failed to select video', error);
    }
  };
  const testCompress = async () => {
    if (!sourceVideo) return;
    try {
      console.log('source of the video in test', sourceVideo);
      // console.log('source of the video', realPath);

      const dstUrl = await Video.compress(
        sourceVideo,
        {
          compressionMethod: 'auto',
          // minimumFileSizeForCompress: 0,
          // getCancellationId: (cancellationId) =>
          //   (cancellationIdRef.current = cancellationId),
        },
        progress => {
          if (backgroundMode) {
            console.log('Compression Progress: ', progress);
            console.log('source of the video in else test');
          } else {
            console.log('source of the video in else test');

            setCompressingProgress(progress);
          }
        },
      );
      console.log({dstUrl}, 'compression result');
      setCompressedVideo(dstUrl);
      setCompressingProgress(0);
    } catch (error) {
      console.log({error}, 'compression error');
      setCompressedVideo(sourceVideo);
      setCompressingProgress(0);
    }
  };
  return (
    <View style={{flex: 1}}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        <View style={{width: 200, backgroundColor: '#f0000'}}>
          {sourceVideoThumbnail && (
            <View>
              <Text>Source</Text>
              <Image
                style={{width: 200, height: 200}}
                source={{uri: sourceVideoThumbnail}}
                resizeMode="contain"
              />
              {sourceSize && <Text>Size: {sourceSize}</Text>}

              {/* {sourceUploadProgress > 0 && (
              <Progress.Bar progress={sourceUploadProgress} width={200} />
            )} */}
            </View>
          )}
        </View>
        <View style={{width: 200, backgroundColor: '#ff0'}}>
          {compressedVideoThumbnail && (
            <View>
              <Text>Compressed</Text>
              <Image
                style={{width: 200, height: 200}}
                source={{uri: compressedVideoThumbnail}}
                resizeMode="contain"
              />
              {compressedSize && <Text>Size: {compressedSize}</Text>}

              {compressedUploadProgress > 0 && (
                <View>
                  {/* <Progress.Bar
                  progress={compressedUploadProgress}
                  width={200}
                /> */}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      {/* {compressingProgress > 0 && (
      <Progress.Bar progress={compressingProgress} width={400} />
    )} */}
      <View
        style={{
          height: 50,
          flexDirection: 'row',
          justifyContent: 'space-around',
          backgroundColor: 'white',
        }}>
        <Button title="Select Video" onPress={selectVideo} />

        <Button
          title="Compress"
          disabled={!sourceVideo}
          onPress={testCompress}
        />
      </View>
    </View>
  );
}
