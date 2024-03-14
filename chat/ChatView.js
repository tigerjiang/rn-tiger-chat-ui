import React, {PureComponent} from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Keyboard,
    Platform,
    Easing,
    Clipboard,
    Dimensions,
    Pressable,
    Animated, FlatList,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {ViewPropTypes as RNViewPropTypes} from 'deprecated-react-native-prop-types';
import PropTypes from 'prop-types';
import {getCurrentTime, changeEmojiText} from './utils';
import Voice from './VoiceView';
import ChatItem from './ChatItem';
import InputBar from './InputBarControl';
import PanelContainer from './panelContainer';
import PagerView from 'react-native-pager-view';
import {StatusBar} from 'react-native';
import {PressableOpacity} from 'react-native-pressable-opacity/src/PressableOpacity';

const {height, width} = Dimensions.get('window');
const ViewPropTypes = RNViewPropTypes || View.propTypes;
let ImageComponent = Image;

class ChatWindow extends PureComponent {
    constructor(props) {
        super(props);
        const {headerHeight, chatType, iphoneXBottomPadding, CustomImageComponent, isIPhoneX} = props;
        this.time = null;
        ImageComponent = CustomImageComponent || Image;
        this._userHasBeenInputed = false;
        this.iosHeaderHeight = 64;
        this.isIphoneX = isIPhoneX;
        this.aniKeybordWillShow = new Animated.Value(0)
        this.aniPanelHeight = new Animated.Value(0)
        this.aniEmojiHeight = new Animated.Value(0)
        this.aniPlusheight  = new Animated.Value(0)
        this.autoFocus = false;
        this.refTextInput = null;
        this.HeaderHeight = headerHeight;
        this.listHeight = height - this.HeaderHeight;
        this.isInverted = false;
        this.rootHeight = 0;
        this.androidHasAudioPermission = false;
        this.scrollToBottom = this._scrollToBottom;
        this.state = {
            messageContent: '',
            cursorIndex: 0,
            listVisibleHeight: 0,
            keyboardShow: false,
            keyboardHeight: 0,
            showVoice: false,
            xHeight: iphoneXBottomPadding,
            isPanelShow: false,
            isEmojiShow: false,
            saveChangeSize: 0,
            inputChangeSize: 0,
            voiceLength: 0,
            voiceEnd: false,
            isVoiceContinue: true,
            contentHeight: 0,
            selectMultiple: false,
            tabSelect: 0,
            modalTitle: '',
            imageModalShow: false,
            imageSource: '',
            isSelfMessage: true,
            listY: 0,
            isInverted: false,
            panelShow: false,
            emojiShow: false,
            messageSelected: [],
            currentIndex: -1,
            pressIndex: -1
        };
    }

    async componentDidMount() {
        Platform.OS === 'ios' && this._willShow();
        Platform.OS === 'ios' && this._willHide();
        Platform.OS === 'android' && this._didShow();
        Platform.OS === 'android' && this._didHide();
    }

    componentWillUnmount() {
        Platform.OS === 'ios' && this._willRemove();
        Platform.OS === 'android' && this._didRemove();
        this.time && clearTimeout(this.time);
    }

    _willShow() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => {
            const {panelShow, emojiShow} = this.state;
            this.setState({keyboardHeight: e.endCoordinates.height, xHeight: 0, keyboardShow: true});
            Animated.timing(this.aniKeybordWillShow,{
                duration: e.duration + 170,
                toValue:  - e.endCoordinates.height,
                useNativeDriver: true,
                easing: Easing.bezier(0.38,0.7,0.125,1),
            }).start();
            if (emojiShow) {
                return this.closeEmoji()
            }
            if (panelShow) {
                return this.closePanel()
            }
        });
    }

    _willHide() {
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', (e) => {
            const {emojiShow, panelShow} = this.state;
            const {iphoneXBottomPadding} = this.props;
            this.setState({keyboardShow: false});
            if (emojiShow) {
                return this.showEmoji()
            }
            if (panelShow) {
                return this.showPanel()
            }
            Animated.timing(this.aniKeybordWillShow,{
                duration: e.duration,
                toValue: 0,
                useNativeDriver: true,
                easing: Easing.out(Easing.exp)
            }).start();
            this.setState({xHeight: iphoneXBottomPadding});
        });
    }

    _didShow() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            const {emojiShow, panelShow} = this.state;
            this.setState({keyboardShow: true});
            if(Platform.OS === 'android'){
                if(emojiShow || panelShow){
                    if(emojiShow) this.closeEmoji();
                    if(panelShow) this.closePanel();
                }else {
                    Animated.timing(this.aniKeybordWillShow, {
                        duration: 0,
                        toValue: 0,
                        useNativeDriver: true,
                        easing: Easing.bezier(0.38, 0.7, 0.125, 1),
                    }).start();
                }
            }
        });
    }

    _didHide() {
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', (e) => {
            const {emojiShow, panelShow} = this.state;
            this.setState({keyboardShow: false});
            if(Platform.OS === 'android'){
                Animated.timing(this.aniKeybordWillShow,{
                    duration: 0,
                    toValue: 0,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.exp)
                }).start();
            }
            if (emojiShow) {
                return this.showEmoji();
            }
            if (panelShow) {
                return this.showPanel();
            }
        });
    }

    _willRemove() {
        this.keyboardWillShowListener.remove();
        this.keyboardWillHideListener.remove();
    }

    _didRemove() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _sendMessage = (type, messageContent) => {
        const {inverted} = this.props;
        this._userHasBeenInputed = true;
        // if (type === 'text' && messageContent.trim().length !== 0) {
        //   messageContent = (this.state.messageContent).join('')
        // }
        this.props.sendMessage(type, messageContent, this.isInverted);
        if(this.refTextInput) this.refTextInput.clear();
        this.setState({messageContent: ''});
        // if (!inverted) {
        //     // this.time && clearTimeout(this.time)
        //     // this.time = setTimeout(() => { this.chatList && this.chatList.scrollToEnd({ animated: true }) }, 200)
        // } else {
        //
        // }
    };

    _changeMethod() {
        this.setState({showVoice: !this.state.showVoice},
            async () => {
                if (Platform.OS === 'android' && this.state.showVoice && !this.androidHasAudioPermission) {
                    const hasPermission = await this.props.checkPermission();
                    this.androidHasAudioPermission = hasPermission;
                    if (!hasPermission) {
                        this.props.requestAndroidPermission();
                    }
                }
            },
        );
        this.setState({saveChangeSize: this.state.inputChangeSize});
        this.time && clearTimeout(this.time);
        this.time = setTimeout(() => this.refTextInput && this.refTextInput.focus(), 300);
        if (!this.state.showVoice && this.state.panelShow) {
            this.setState({xHeight: this.props.iphoneXBottomPadding});
            return this.closePanel(true);
        }
        if (!this.state.showVoice && this.state.emojiShow) {
            this.setState({xHeight: this.props.iphoneXBottomPadding});
            return this.closeEmoji(true);
        }
    }

    _changeText(e) {
        this.setState({messageContent: e});
    }

    _onContentSizeChange(e) {
        // const {inverted} = this.props;
        // const changeHeight = e.nativeEvent.contentSize.height;
        // if (changeHeight === 34) {
        //     return;
        // }
        // this.setState({inputChangeSize: changeHeight <= 70 ? changeHeight : 70});
        // if (!inverted) {
        //     this.chatList && this.chatList.scrollToEnd({animated: true});
        // }
    }

    _onVoiceStart = () => {
        if (Platform.OS === 'android') {
            if (this.androidHasAudioPermission) {
                console.log("_onVoiceStart",this.androidHasAudioPermission);
                this.setState({voiceEnd: true});
                this.voice.show();
            }
        } else {
            this.setState({voiceEnd: true});
            this.voice.show();
        }
    };

    _onVoiceEnd = () => {
        this.voice.close();
        this.setState({voiceEnd: false});
    };

    _PressAvatar = (isSelf, targetId) => {
        const {pressAvatar} = this.props;
        pressAvatar(isSelf, targetId);
        this.closeAll();
    };

    _scrollToBottom() {
        console.log("_scrollToBottom...");
        this.chatList && this.chatList.scrollToOffset({
            animated: true,
            offset: 0
        });
        // const {inverted} = this.props;
        // if (listHeightAndWidth !== undefined) {
        //     const {contentHeight} = listHeightAndWidth;
        //     this.isInverted = contentHeight > this.listHeight;
        // }
        // // if (!inverted) {
        // //     setTimeout(() => {
        // //         this.chatList && this.chatList.scrollToEnd({
        // //             animated: 200//this._userHasBeenInputed,
        // //         });
        // //     }, this._userHasBeenInputed ? 0 : 130);
        // // }
    }

    _onFocus = () => {
        if (Platform.OS === 'android') {
            const { emojiShow, panelShow} = this.state;
            if(emojiShow) this.closeEmoji();
            if(panelShow) this.closePanel();
            this.refTextInput.blur();
            setTimeout(() => {
                this.refTextInput && this.refTextInput.focus();
            },100);
            // this.setState({});
        }
    };

    closePanel = (realClose = false, callback) => {
        const {keyboardShow} = this.state;
        if(!keyboardShow || (Platform.OS === 'android' && keyboardShow)) {
            Animated.timing(this.aniKeybordWillShow, {
                duration: 200,
                toValue: 0,
                useNativeDriver: true,
                easing: Easing.bezier(0.38, 0.7, 0.125, 1),
            }).start();
        }
        Animated.timing(this.aniPanelHeight,{
            duration: Platform.OS === 'android' ? 0 :200,
            toValue: 0,
            useNativeDriver: true,
            easing: Easing.bezier(0.38,0.7,0.125,1),
        }).start();
        this.setState({panelShow: false});
        this.props.panelClose && this.props.panelClose(this.props.allPanelHeight);
        callback && callback();
    };

    showPanel = (callback) => {
        this.setState({xHeight: 0});
        Animated.timing(this.aniKeybordWillShow,{
            duration: 300,
            toValue: -this.props.allPanelHeight - this.props.iphoneXBottomPadding,
            useNativeDriver: true,
            easing: Easing.bezier(0.38,0.7,0.125,1),
        }).start();
        Animated.timing(this.aniPanelHeight,{
            duration: 300,
            toValue: -this.props.allPanelHeight - this.props.iphoneXBottomPadding,
            useNativeDriver: true,
            easing: Easing.bezier(0.38,0.7,0.125,1),
        }).start();
        callback && callback();
        this.props.panelOpen && this.props.panelOpen(this.props.allPanelHeight);
        this.setState({panelShow: true});
    };

    isShowPanel = () => {
        const {keyboardShow, panelShow, emojiShow} = this.state;
        if (Platform.OS === 'ios') {
            if (panelShow) {
                return this.refTextInput && this.refTextInput.focus();
            } else {
                if (emojiShow) {
                    return this.closeEmoji(false, () => this.showPanel());
                }
                if (!keyboardShow) {
                    this.showPanel();
                } else {
                    this.setState({
                        keyboardShow: false,
                        keyboardHeight: 0,
                        xHeight: 0,
                        panelShow: true,
                    });
                    this.refTextInput.blur();
                }
                if (this.state.showVoice) {
                    this.setState({showVoice: false});
                }
            }
        } else {
            if (panelShow) {
                return this.closePanel(true, () => {
                    this.refTextInput && this.refTextInput.focus();
                });
            } else {
                if (emojiShow) {
                    return this.closeEmoji(false, () => this.showPanel());
                }
                if (!keyboardShow) {
                    this.showPanel();
                } else {
                    this.setState({keyboardShow: false, panelShow: true});
                    this.refTextInput.blur();
                }
                if (this.state.showVoice) {
                    this.setState({showVoice: false});
                }
            }
        }
    };

    showEmoji = (callback) => {
        this.setState({xHeight: 0});
        Animated.timing(this.aniKeybordWillShow,{
            duration: 200,
            toValue: -this.props.allPanelHeight - this.props.iphoneXBottomPadding,
            useNativeDriver: true,
            easing: Easing.bezier(0.38,0.7,0.125,1),
        }).start();
        Animated.timing(this.aniPanelHeight,{
            duration: 200,
            toValue: -this.props.allPanelHeight - this.props.iphoneXBottomPadding,
            useNativeDriver: true,
            easing: Easing.bezier(0.38,0.7,0.125,1),
        }).start();
        this.setState({emojiShow: true});
        this.props.panelOpen && this.props.panelOpen(this.props.allPanelHeight);
        callback && callback();

    };

    closeEmoji = (realClose = false, callback) => {
        const {keyboardShow} = this.state;
        if(!keyboardShow || (Platform.OS === 'android' && keyboardShow)) {
            Animated.timing(this.aniKeybordWillShow, {
                duration: 200,
                toValue: 0,
                useNativeDriver: true,
                easing: Easing.bezier(0.38, 0.7, 0.125, 1),
            }).start();
        }
        Animated.timing(this.aniPanelHeight,{
            duration: 200,
            toValue: 0,
            useNativeDriver: true,
            easing: Easing.bezier(0.38,0.7,0.125,1),
        }).start();
        this.setState({emojiShow: false});
        this.props.panelClose && this.props.panelClose(this.props.allPanelHeight);
        callback && callback();
    };

    tabEmoji = () => {
        const {keyboardShow, emojiShow, panelShow} = this.state;
        const {showVoice} = this.state;
        if (Platform.OS === 'ios') {
            if (emojiShow) {
                return this.refTextInput && this.refTextInput.focus();
            }
            if (panelShow) {
                return this.closePanel(false, () => this.showEmoji());
            }
            if (!keyboardShow) {
                this.showEmoji();
            } else {
                this.setState({
                    keyboardShow: false,
                    emojiShow: true,
                    keyboardHeight: 0,
                    xHeight: 0,
                });
                this.refTextInput.blur();
            }
            if (showVoice) {
                this.setState({showVoice: false});
            }
        } else {
            if (emojiShow) {
                return this.closeEmoji(true, () => {
                    if (this.refTextInput) {
                        this.refTextInput.blur();
                        setTimeout(() => this.refTextInput && this.refTextInput.focus(),100);
                    }
                });
            } else {
                if (panelShow) {
                    return this.closePanel(false, () => this.showEmoji());
                }
                if (!keyboardShow) {
                    this.showEmoji();
                } else {
                    this.setState({
                        keyboardShow: false,
                        emojiShow: true,
                    });
                    this.refTextInput.blur();
                }
                if (this.state.showVoice) {
                    this.setState({showVoice: false});
                }
            }
        }
    };

    selectMultiple = (isSelect, index, message) => {
        const messageArr = this.state.messageSelected;
        const existArr = messageArr.filter((item) => item.index === index);
        if (existArr.length === 0) {
            messageArr.push({index, isSelect, message});
            this.setState({messageSelected: messageArr});
        } else {
            const filterArr = messageArr.filter((item) => item.index !== index);
            if (isSelect) {
                filterArr.push({index, isSelect, message});
            }
            this.setState({messageSelected: filterArr});
        }
    };

    _closeMultipleSelect = () => {
        this.setState({
            selectMultiple: false,
            currentIndex: -1,
        });
        // Animated.timing(this.leftHeight, {
        //     duration: 200,
        //     toValue: 0,
        //     useNativeDriver: true,
        //     easing: Easing.linear(),
        // }).start();
    };

    _openMultipleSelect = () => {
        this.setState({selectMultiple: true});
        // Animated.timing(this.leftHeight, {
        //     duration: 200,
        //     toValue: 1,
        //     useNativeDriver: true,
        //     easing: Easing.linear(),
        // }).start();
    };

    show = (view, type, index, text, message) => {
        if (!this.props.usePopView) {
            this.props.onMessageLongPress(type, index, text, message);
        } else {
            view.measure((x, y, width, height, pageX, pageY) => {
                let items = null;
                if (this.props.setPopItems) {
                    items = this.props.setPopItems(type, index, text, message);
                } else {
                    items = [
                        {
                            title: '删除',
                            onPress: () => {
                                this.props.delMessage({index, message}, this.isInverted);
                            },
                        },
                        {
                            title: '多选',
                            onPress: () => {
                                this.multipleSelect(index, message);
                            },
                        },
                    ];
                    if (type === 'text') {
                        items = [
                            {
                                title: '复制',
                                onPress: () => Clipboard.setString(text),
                            },
                            {
                                title: '删除',
                                onPress: () => {
                                    this.props.delMessage({index, message}, this.isInverted);
                                },
                            },
                            {
                                title: '多选',
                                onPress: () => {
                                    this.multipleSelect(index, message);
                                },
                            },
                        ];
                    }
                }
                if (items === null) {
                    console.error('need to return items');
                }
                if (items.length > 0) {
                    PopView.show({x: pageX, y: pageY, width, height}, items, {popoverStyle: this.props.popoverStyle});
                }
            });
        }
    };

    multipleSelect = (index, message) => {
        this.closeAll();
        Keyboard.dismiss();
        this._openMultipleSelect();
        this.props.changeHeaderLeft();
        if (index !== undefined) {
            this.state.messageSelected.length = 0;
            this.setState({
                currentIndex: index,
            });
            this.state.messageSelected.push({index, message, isSelect: true});
        }
    };

    changeVoiceStatus = (status) => {
        if(this.props.onVoiceCancel) {
            this.props.onVoiceCancel(status);
        }
        this.setState({isVoiceContinue: status});
    };

    closeAll = (callback) => {
        if (this.state.panelShow) {
            this.setState({xHeight: this.props.iphoneXBottomPadding});
            return this.closePanel(true, callback);
        }
        if (this.state.emojiShow) {
            this.setState({xHeight: this.props.iphoneXBottomPadding});
            return this.closeEmoji(true, callback);
        }
    };

    _loadHistory = async () => {
        const {inverted} = this.props;
        if (!inverted) {
            return;
        }
        await this.props.loadHistory();
    };

    _onEmojiSelected = (emojiItem) => {
        this._sendMessage('emoji', emojiItem);
    };

    savePressIndex = (id) => {
        this.setState({pressIndex: id});
    };

    renderBg = (bg) => {
        const {renderChatBg} = this.props;
        if (bg === null) {
            return null;
        }
        if (renderChatBg === undefined) {
            const source = typeof (bg) === 'number' ? bg : {uri: bg};
            return (
                <ImageComponent source={source} style={{position: 'absolute', width, top: 0, height}} resizeMode="cover"/>
            );
        } else {
            return renderChatBg(bg);
        }
    };

    render() {
        const {messageList, allPanelHeight, inverted, chatBackgroundImage, chatType, voiceCustom} = this.props;
        const {
            messageContent,
            voiceEnd,
            inputChangeSize,
            hasPermission,
            xHeight,
            keyboardHeight,
            keyboardShow,
            panelShow,
            emojiShow,
        } = this.state;
        const currentList = messageList.slice().sort((a, b) => inverted
            ? (b.time - a.time)
            : (a.time - b.time));
        const panelContainerHeight = allPanelHeight + (this.isIphoneX ? this.props.iphoneXBottomPadding : StatusBar.currentHeight);
        return (
            <View style={{flex: 1, position: 'relative'}} onLayout={(e) => this.rootHeight = e.nativeEvent.layout.height}>
                {this.renderBg(chatBackgroundImage)}
                <View style={Platform.OS === 'android' ? {
                    flex: 1,
                    backgroundColor: 'transparent',
                    paddingTop: this.HeaderHeight,
                } : {
                    backgroundColor: 'transparent',
                    paddingTop: this.HeaderHeight,
                    height: height,
                    position: 'relative',
                }}
                >
                    <View style={[{
                        flex: 1,
                        backgroundColor: 'transparent',
                    }, this.props.chatWindowStyle]}>
                        <Animated.View style={{flex:1,position:'relative',transform: [{translateY: this.aniKeybordWillShow}]}}>
                            {this.props.renderContent && this.props.renderContent()}
                            {(panelShow || emojiShow) &&
                                <Pressable onPress={() => this.closeAll(null)} style={{
                                    position: 'absolute',
                                    zIndex:2,
                                    width: '100%',
                                    height: '100%'
                                }}/>
                            }
                            <FlashList
                                {...this.props.flatListProps}
                                estimatedItemSize={100}
                                ref={e => (this.chatList = e)}
                                inverted={true}
                                data={currentList}
                                ListFooterComponent={this.props.renderLoadEarlier}
                                extraData={this.props.extraData}
                                automaticallyAdjustContentInsets={false}
                                onScroll={(e) => {
                                    this.props.onScroll(e);
                                }}
                                showsVerticalScrollIndicator={this.props.showsVerticalScrollIndicator}
                                onEndReachedThreshold={this.props.onEndReachedThreshold}
                                enableEmptySections
                                scrollEventThrottle={100}
                                keyExtractor={(item,index) => item.id + index}
                                onEndReached={() => this._loadHistory()}
                                onLayout={(e) => {
                                    // this._scrollToBottom();
                                    // this.listHeight = e.nativeEvent.layout.height;
                                }}
                                onContentSizeChange={(contentWidth, contentHeight) => {
                                    // this._scrollToBottom({contentWidth, contentHeight});
                                }}
                                renderItem={({item, index}) =>
                                    <ChatItem
                                        ImageComponent={ImageComponent}
                                        user={this.props.userProfile}
                                        chatType={chatType}
                                        lastReadAt={this.props.lastReadAt}
                                        showIsRead={this.props.showIsRead}
                                        isReadStyle={this.props.isReadStyle}
                                        reSendMessage={this.props.reSendMessage}
                                        renderMessageCheck={this.props.renderMessageCheck}
                                        message={item}
                                        currentIndex={this.state.currentIndex}
                                        isOpen={this.state.selectMultiple}
                                        selectMultiple={this.selectMultiple}
                                        rowId={index}
                                        popShow={this.show}
                                        messageSelectIcon={this.props.messageSelectIcon}
                                        renderMessageTime={this.props.renderMessageTime}
                                        onMessageLongPress={this.show}
                                        onMessagePress={this.props.onMessagePress}
                                        onPressAvatar={this._PressAvatar}
                                        messageErrorIcon={this.props.messageErrorIcon}
                                        voiceLeftIcon={this.props.voiceLeftIcon}
                                        voiceRightIcon={this.props.voiceRightIcon}
                                        closeAll={this.closeAll}
                                        renderAvatar={this.props.renderAvatar}
                                        avatarStyle={this.props.avatarStyle}
                                        showUserName={this.props.showUserName}
                                        userNameStyle={this.props.userNameStyle}
                                        itemContainerStyle={this.props.itemContainerStyle}
                                        renderErrorMessage={this.props.renderErrorMessage}
                                        renderTextMessage={this.props.renderTextMessage}
                                        renderImageMessage={this.props.renderImageMessage}
                                        renderVoiceMessage={this.props.renderVoiceMessage}
                                        renderVideoMessage={this.props.renderVideoMessage}
                                        renderLocationMessage={this.props.renderLocationMessage}
                                        renderShareMessage={this.props.renderShareMessage}
                                        renderVideoCallMessage={this.props.renderVideoCallMessage}
                                        renderVoiceCallMessage={this.props.renderVoiceCallMessage}
                                        renderRedEnvelopeMessage={this.props.renderRedEnvelopeMessage}
                                        renderFileMessage={this.props.renderFileMessage}
                                        renderSystemMessage={this.props.renderSystemMessage}
                                        renderPatMessage={this.props.renderPatMessage}
                                        renderCustomMessage={this.props.renderCustomMessage}
                                        rightMessageBackground={this.props.rightMessageBackground}
                                        leftMessageBackground={this.props.leftMessageBackground}
                                        voiceLoading={this.props.voiceLoading}
                                        voicePlaying={this.props.voicePlaying}
                                        savePressIndex={this.savePressIndex}
                                        pressIndex={this.state.pressIndex}
                                        voiceLeftLoadingColor={this.props.voiceLeftLoadingColor}
                                        voiceRightLoadingColor={this.props.voiceRightLoadingColor}
                                        leftMessageTextStyle={this.props.leftMessageTextStyle}
                                        rightMessageTextStyle={this.props.rightMessageTextStyle}
                                    />}
                            />
                        </Animated.View>
                    </View>
                    {
                        this.props.showInput
                            ? <InputBar
                                setTextInputRef={(ref) => this.refTextInput = ref}
                                ImageComponent={ImageComponent}
                                aniKeybordWillShow={this.aniKeybordWillShow}
                                rootHeight={this.rootHeight}
                                allPanelHeight={this.props.allPanelHeight}
                                emojiIcon={this.props.emojiIcon}
                                keyboardIcon={this.props.keyboardIcon}
                                plusIcon={this.props.plusIcon}
                                voiceIcon={this.props.voiceIcon}
                                sendIcon={this.props.sendIcon}
                                sendUnableIcon={this.props.sendUnableIcon}
                                isIphoneX={this.isIphoneX}
                                placeholder={this.props.placeholder}
                                useVoice={this.props.useVoice}
                                onMethodChange={this._changeMethod.bind(this)}
                                showVoice={this.state.showVoice}
                                onSubmitEditing={(type, content) => this._sendMessage(type, content)}
                                messageContent={messageContent}
                                textChange={this._changeText.bind(this)}
                                onContentSizeChange={this._onContentSizeChange.bind(this)}
                                xHeight={xHeight}
                                onFocus={this._onFocus}
                                autoFocus={this.autoFocus}
                                voiceStart={this._onVoiceStart}
                                voiceEnd={this._onVoiceEnd}
                                isVoiceEnd={voiceEnd}
                                voiceStatus={this.state.isVoiceContinue}
                                changeVoiceStatus={this.changeVoiceStatus}
                                inputChangeSize={inputChangeSize}
                                hasPermission={hasPermission}
                                pressInText={this.props.pressInText}
                                pressOutText={this.props.pressOutText}
                                isShowPanel={this.isShowPanel}
                                showEmoji={this.tabEmoji}
                                isEmojiShow={this.state.emojiShow}
                                isPanelShow={this.state.panelShow}
                                paddingHeight={this.paddingHeight}
                                useEmoji={false}
                                usePlus={false}
                                inputStyle={this.props.inputStyle}
                                inputOutContainerStyle={this.props.inputOutContainerStyle}
                                inputContainerStyle={this.props.inputContainerStyle}
                                inputHeightFix={this.props.inputHeightFix}
                                audioHasPermission={this.androidHasAudioPermission}
                            />
                            : <View style={{width:'100%',height:this.props.iphoneXBottomPadding}} />
                    }

                    {this.props.showInput ?
                        <PanelContainer
                            aniPanelHeight={this.aniPanelHeight}
                            aniEmojiHeight={this.aniEmojiHeight}
                            aniPlusHeight={this.aniPlusheight}
                            panelContainerBackgroundColor={this.props.panelContainerBackgroundColor}
                            visibleHeight={this.visibleHeight}
                            panelContainerHeight={panelContainerHeight}
                            usePlus={this.props.usePlus}
                            useEmoji={this.props.useEmoji}
                            emojiList={this.props.emojiList}
                            panelHeight={this.panelHeight}
                            isIphoneX={this.isIphoneX}
                            HeaderHeight={this.HeaderHeight}
                            allPanelHeight={this.props.allPanelHeight}
                            iphoneXBottomPadding={this.props.iphoneXBottomPadding}
                            panelSource={this.props.panelSource}
                            renderPanelRow={this.props.renderPanelRow}
                            panelContainerStyle={this.props.panelContainerStyle}
                            ImageComponent={ImageComponent}
                            emojiHeight={this.emojiHeight}
                            onEmojiSelected={this._onEmojiSelected}
                            emojiShow={emojiShow}
                            panelShow={panelShow}
                        />
                        : null
                    }
                    {
                        voiceCustom ? null
                            : this.state.showVoice
                            ? <Voice
                                ImageComponent={ImageComponent}
                                ref={(e) => (this.voice = e)}
                                sendVoice={(type, content) => this._sendMessage(type, content)}
                                changeVoiceStatus={this.changeVoiceStatus}
                                voiceStatus={this.state.isVoiceContinue}
                                audioPath={this.props.audioPath}
                                audioHasPermission={this.androidHasAudioPermission}
                                audioPermissionState={this.props.audioHasPermission}
                                voiceSpeakIcon={this.props.voiceSpeakIcon}
                                audioOnProgress={this.props.audioOnProgress}
                                audioOnFinish={this.props.audioOnFinish}
                                audioInitPath={this.props.audioInitPath}
                                audioRecord={this.props.audioRecord}
                                audioStopRecord={this.props.audioStopRecord}
                                audioPauseRecord={this.props.audioPauseRecord}
                                audioCurrentTime={this.props.audioCurrentTime}
                                audioResumeRecord={this.props.audioResumeRecord}
                                audioHandle={this.props.audioHandle}
                                setAudioHandle={this.props.setAudioHandle}
                                errorIcon={this.props.voiceErrorIcon}
                                cancelIcon={this.props.voiceCancelIcon}
                                errorText={this.props.voiceErrorText}
                                voiceCancelText={this.props.voiceCancelText}
                                voiceNoteText={this.props.voiceNoteText}
                                renderVoiceView={this.props.renderVoiceView}
                                voiceVolume={this.props.voiceVolume}
                            />
                            : null
                    }
                </View>
            </View>
        );
    }
}

export default ChatWindow;
ChatWindow.propTypes = {
    /* defaultProps */
    messageList: PropTypes.array.isRequired,
    inverted: PropTypes.bool,
    isIPhoneX: PropTypes.bool.isRequired,
    lastReadAt: PropTypes.object,
    chatBackgroundImage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onScroll: PropTypes.func,
    onEndReachedThreshold: PropTypes.number,
    chatWindowStyle: ViewPropTypes.style,
    sendMessage: PropTypes.func,
    renderAvatar: PropTypes.func,
    avatarStyle: ViewPropTypes.style,
    allPanelAnimateDuration: PropTypes.number,
    chatType: PropTypes.oneOf(['friend', 'group']),
    onMessagePress: PropTypes.func,
    onMessageLongPress: PropTypes.func,
    renderMessageTime: PropTypes.func,
    pressAvatar: PropTypes.func,
    renderErrorMessage: PropTypes.func,
    renderChatBg: PropTypes.func,
    reSendMessage: PropTypes.func,
    headerHeight: PropTypes.number.isRequired,
    iphoneXBottomPadding: PropTypes.number,
    showUserName: PropTypes.bool,
    showIsRead: PropTypes.bool,
    showInput: PropTypes.bool,
    isReadStyle: PropTypes.object,
    userProfile: PropTypes.shape({
        id: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
        nickName: PropTypes.string,
    }),
    panelSource: PropTypes.array,
    renderPanelRow: PropTypes.func,
    panelContainerStyle: ViewPropTypes.style,
    itemContainerStyle: ViewPropTypes.style,
    allPanelHeight: PropTypes.number,
    messageErrorIcon: PropTypes.element,
    loadHistory: PropTypes.func,
    leftMessageBackground: PropTypes.string,
    rightMessageBackground: PropTypes.string,
    leftMessageTextStyle: PropTypes.object,
    rightMessageTextStyle: PropTypes.object,
    renderLoadEarlier: PropTypes.func,
    extraData: PropTypes.any,
    containerBackgroundColor: PropTypes.string,
    showsVerticalScrollIndicator: PropTypes.bool,
    userNameStyle: PropTypes.object,
    panelContainerBackgroundColor: PropTypes.string,
    /* popProps */
    usePopView: PropTypes.bool,
    popoverStyle: ViewPropTypes.style,
    renderDelPanel: PropTypes.func,
    changeHeaderLeft: PropTypes.func,
    setPopItems: PropTypes.func,
    messageDelIcon: PropTypes.element,
    messageSelectIcon: PropTypes.element,
    delMessage: PropTypes.func,
    renderMessageCheck: PropTypes.func,

    /* inputBarProps */
    emojiIcon: PropTypes.element,
    placeholder: PropTypes.string,
    keyboardIcon: PropTypes.element,
    plusIcon: PropTypes.element,
    sendIcon: PropTypes.element,
    sendUnableIcon: PropTypes.element,
    inputStyle: ViewPropTypes.style,
    inputOutContainerStyle: ViewPropTypes.style,
    inputContainerStyle: ViewPropTypes.style,
    inputHeightFix: PropTypes.number,
    useEmoji: PropTypes.bool,
    emojiList: PropTypes.array,
    usePlus: PropTypes.bool,
    /* voiceProps */
    useVoice: PropTypes.bool,
    voiceCustom: PropTypes.bool,
    pressInText: PropTypes.string,
    pressOutText: PropTypes.string,
    voiceIcon: PropTypes.element,
    voiceLeftIcon: PropTypes.element,
    voiceRightIcon: PropTypes.element,
    voiceErrorIcon: PropTypes.element,
    voiceCancelIcon: PropTypes.element,
    voiceSpeakIcon: PropTypes.array,
    audioPath: PropTypes.string,
    audioOnProgress: PropTypes.func,
    audioOnFinish: PropTypes.func,
    audioInitPath: PropTypes.func,
    audioRecord: PropTypes.func,
    audioStopRecord: PropTypes.func,
    audioPauseRecord: PropTypes.func,
    audioResumeRecord: PropTypes.func,
    audioCurrentTime: PropTypes.number,
    audioHandle: PropTypes.bool,
    setAudioHandle: PropTypes.func,
    audioHasPermission: PropTypes.bool,
    checkPermission: PropTypes.func,
    requestAndroidPermission: PropTypes.func,
    voiceErrorText: PropTypes.string,
    voiceCancelText: PropTypes.string,
    voiceNoteText: PropTypes.string,
    voiceLoading: PropTypes.bool,
    voicePlaying: PropTypes.bool,
    voiceLeftLoadingColor: PropTypes.string,
    voiceVolume: PropTypes.number,
    voiceRightLoadingColor: PropTypes.string,
    /* bubbleProps */
    renderTextMessage: PropTypes.func,
    renderImageMessage: PropTypes.func,
    renderVoiceMessage: PropTypes.func,
    renderVoiceView: PropTypes.func,
    renderVideoMessage: PropTypes.func,
    renderLocationMessage: PropTypes.func,
    renderShareMessage: PropTypes.func,
    renderVideoCallMessage: PropTypes.func,
    renderVoiceCallMessage: PropTypes.func,
    renderRedEnvelopeMessage: PropTypes.func,
    renderFileMessage: PropTypes.func,
    renderSystemMessage: PropTypes.func,
    renderCustomMessage: PropTypes.func,
    renderPatMessage: PropTypes.func,
    /* delPanelProps */
    delPanelStyle: ViewPropTypes.style,
    delPanelButtonStyle: ViewPropTypes.style,
    flatListProps: PropTypes.object,
};

ChatWindow.defaultProps = {
    renderLoadEarlier: () => (null),
    extraData: null,
    chatType: 'friend',
    chatBackgroundImage: null,
    inverted: false,
    headerHeight: 44,
    allPanelAnimateDuration: 100,
    messageList: [],
    showUserName: false,
    panelContainerStyle: {},
    showInput: true,
    sendMessage: (type, content, isInverted) => {
        console.log(type, content, isInverted, 'send');
    },
    reSendMessage: (message) => {
        console.log(message, 'reSend');
    },
    leftMessageBackground: '#fff',
    rightMessageBackground: '#a0e75a',
    useVoice: true,
    useEmoji: true,
    emojiList: [],
    usePlus: true,
    iphoneXBottomPadding: 34, // 安全区域
    onEndReachedThreshold: 0.1,
    usePopView: true,
    userProfile: {
        id: '88886666',
        avatar: '',
        nickName: 'Test',
    },
    panelSource: [],
    renderPanelRow: () => {
    },
    onScroll: () => {
    },
    renderErrorMessage: (messageStatus) => {
        switch (messageStatus) {
            case -1:
                return <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginHorizontal: 80,
                    backgroundColor: '#e6e6e6',
                    paddingVertical: 8,
                    borderRadius: 4,
                    marginBottom: 10,
                }}>
                    <Text style={{color: '#333', fontSize: 10}}>好友关系异常，发送失败</Text>
                </View>;
            default :
                return null;
        }
    },
    popoverStyle: {
        backgroundColor: '#333',
    },
    allPanelHeight: 200,
    loadHistory: () => {
        console.log('loadMore');
    },
    onMessagePress: (type, index, content, message) => {
        console.log(type, index, content, message);
    },
    onMessageLongPress: (type, index, content, message) => {
        console.log('longPress', type, index, content, message);
    },
    renderMessageTime: (time) =>
        <View style={{justifyContent: 'center', alignItems: 'center', paddingTop: 10}}>
            <View style={{backgroundColor: '#e6e6e6', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 16}}>
                <Text style={{color: '#333', fontSize: 10}}>{getCurrentTime(parseInt(time))}</Text>
            </View>
        </View>,
    placeholder: '请输入...',
    pressInText: '按住 说话',
    pressOutText: '送开 发送',
    changeHeaderLeft: () => {
    },
    pressAvatar: (isSelf, targetId) => {
        console.log(isSelf, targetId);
    },
    voiceSpeakIcon: [
        require('../source/speak0.png'),
        require('../source/speak1.png'),
        require('../source/speak2.png'),
        require('../source/speak3.png'),
        require('../source/speak4.png'),
        require('../source/speak5.png'),
        require('../source/speak6.png'),
        require('../source/speak7.png'),
        require('../source/speak8.png'),
    ],
    voiceVolume: 10,
    delMessage: (content, isInverted) => {
        console.log(content, isInverted);
    },
    audioPath: '',
    panelContainerBackgroundColor: '#f5f5f5',
    audioOnProgress: () => {
    },
    audioOnFinish: () => {
    },
    audioInitPath: () => {
    },
    audioRecord: () => {
    },
    audioStopRecord: () => {
    },
    audioPauseRecord: () => {
    },
    audioResumeRecord: () => {
    },
    audioCurrentTime: 0,
    audioHandle: true,
    setAudioHandle: () => {
    },
    audioHasPermission: false,
    checkPermission: () => {
    },
    requestAndroidPermission: () => {
    },
    voiceErrorText: '说话时间太短',
    voiceCancelText: '松开手指取消发送',
    voiceNoteText: '手指上划，取消发送',
    voiceLoading: false,
    voicePlaying: false,
    voiceLeftLoadingColor: '#ccc',
    voiceRightLoadingColor: '#628b42',
    inputHeightFix: 0,
    containerBackgroundColor: '#f5f5f5',
    showsVerticalScrollIndicator: false,
    showIsRead: false,
    voiceCustom: false
}
