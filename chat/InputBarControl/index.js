import React, { PureComponent } from 'react'
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,Keyboard
} from 'react-native'
import Container from './Container'
import Voice from './Voice'
import VoiceButton from './VoiceButton'
import Input from './Input'
import {PressableOpacity} from 'react-native-pressable-opacity';
const { width } = Dimensions.get('window')

export default class InputBar extends PureComponent {
  constructor (props) {
    super(props)
    this.inputHeight = 0
  }

  setInputHeight = (height) => {
    this.inputHeight = height
  }
  renderIcon = () => {
    const { sendIcon, plusIcon, usePlus, messageContent, sendUnableIcon, ImageComponent } = this.props
    const sendAbleIcon = sendIcon || <ImageComponent source={require('../../source/sendAble.png')} style={{ width: 30, height: 30 }} />
    const sendUnableIconDefault = sendUnableIcon || <ImageComponent source={require('../../source/send.png')} style={{ width: 30, height: 30 }} />
    if (usePlus) {
      if (messageContent.trim().length) {
        return sendAbleIcon
      } else {
        return plusIcon || <ImageComponent source={require('../../source/more.png')} style={{ width: 30, height: 30 }} />
      }
    } else {
      return messageContent.trim().length ? sendAbleIcon : sendUnableIconDefault
    }
  }
  // renderIcon = () => {
  //   const { sendIcon, plusIcon, usePlus, messageContent, sendUnableIcon, ImageComponent } = this.props
  //   if (usePlus) {
  //     return plusIcon || <ImageComponent source={require('../../source/more.png')} style={{ width: 30, height: 30 }} />
  //   } else {
  //     return messageContent.trim().length ? sendAbleIcon : sendUnableIconDefault
  //   }
  // }

  renderEmojieIcon = () => {
    const { isEmojiShow, keyboardIcon, emojiIcon, ImageComponent } = this.props
    return emojiIcon || <ImageComponent source={require('../../source/emoji.png')} style={{ width: 30, height: 30 }} />
  }

  render () {
    const {
      ref,
      messageContent,
      onSubmitEditing = () => {},
      textChange = () => {}, onMethodChange = () => {}, onContentSizeChange = () => {},
      inputStyle,
      inputOutContainerStyle,
      inputContainerStyle,
      inputHeightFix,
      xHeight,
      isVoiceEnd,
      useVoice,
      useEmoji,
      usePlus,
      inputChangeSize,
      placeholder,
      pressInText,
      pressOutText,
      isShowPanel,
      isPanelShow,
      audioHasPermission,
      onFocus,
      keyboardIcon,
      voiceIcon,
      isEmojiShow,
      isIphoneX,
      ImageComponent,
      showVoice,
      voiceStart,
      rootHeight,
      voiceEnd,
      changeVoiceStatus,
      aniKeybordWillShow,
      setTextInputRef,
      autoFocus
    } = this.props
    const enabled = (() => {
      if (Platform.OS === 'android') {
        if (isPanelShow) {
          return false
        }
        if (isEmojiShow) {
          return false
        }
        return true
      } else {
        return true;
      }
    })()
    return (
      <Container
        setInputHeight={this.setInputHeight}
        inputOutContainerStyle={inputOutContainerStyle}
        isIphoneX={isIphoneX}
        xHeight={xHeight}
        inputContainerStyle={inputContainerStyle}
        aniKeybordWillShow={aniKeybordWillShow}
      >
        <Voice
            showVoice={showVoice}
            ImageComponent={ImageComponent}
            keyboardIcon={keyboardIcon}
            voiceIcon={voiceIcon}
            inputHeightFix={inputHeightFix}
            onMethodChange={onMethodChange}
        />
        <View style={[styles.container,{width: useEmoji ? width - 130 : width - 100}]}>
          {showVoice
            ? <VoiceButton
              audioHasPermission={audioHasPermission}
              inputHeight={this.inputHeight}
              rootHeight={rootHeight}
              showVoice={showVoice}
              voiceStart={voiceStart}
              isVoiceEnd={isVoiceEnd}
              inputHeightFix={inputHeightFix}
              pressOutText={pressOutText}
              pressInText={pressInText}
              voiceEnd={voiceEnd}
              changeVoiceStatus={changeVoiceStatus}
              />
            : <Input
              onFocus={onFocus}
              placeholder={placeholder}
              onContentSizeChange={onContentSizeChange}
              textChange={textChange}
              enabled={enabled}
              autoFocus={autoFocus}
              setTextInputRef={setTextInputRef}
              onSubmit={() => {
                console.log("send text",messageContent);
                onSubmitEditing('text', messageContent);
              }}
              messageContent={messageContent}
              inputHeightFix={inputHeightFix}
              inputChangeSize={inputChangeSize}
              inputStyle={inputStyle}
            />}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {useEmoji &&
            <PressableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Keyboard.dismiss();
                  this.props.showEmoji()
                }}
            >
              {this.renderEmojieIcon()}
            </PressableOpacity>
          }
          <PressableOpacity
            style={{ marginLeft: 8 }}
            onPress={() => {
              if (messageContent.trim().length > 0) {
                onSubmitEditing('text', messageContent)
              } else {
                if (usePlus) {
                  isShowPanel(!isPanelShow)
                } else {
                  return null
                }
              }
            }}
            activeOpacity={0.7}
          >
            {this.renderIcon()}
          </PressableOpacity>
        </View>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  commentBar: {
    width: width,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    borderColor: '#ccc',
    borderTopWidth: StyleSheet.hairlineWidth
  },
  container: {
    marginHorizontal: 8,
    borderRadius: 18,
    borderColor: '#ccc',
    width: width - 130,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 0.8
  },
  commentBar__input: {
    borderRadius: 18,
    height: 26,
    width: '100%',
    padding: 0,
    paddingHorizontal: 20
  }
})
