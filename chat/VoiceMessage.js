import React, {PureComponent} from 'react';
import {
    View, TouchableOpacity, StyleSheet, Text, ActivityIndicator, Dimensions, Platform,
} from 'react-native';
import {PressableOpacity} from 'react-native-pressable-opacity';
import Triangle from "@react-native-toolkit/triangle";

const {width} = Dimensions.get('window');

export default class VoiceMessage extends PureComponent {
    constructor(props) {
        super(props);
        this.playTime = null;
        this.state = {
            loading: false, progress: 2,
        };
    }

    UNSAFE_componentWillReceiveProps(next) {
        if (next.pressIndex === next.rowId) {
            this.setState({loading: next.voiceLoading});
            if (next.voicePlaying) {
                this._play();
            } else {
                this.playTime && clearInterval(this.playTime);
                this.setState({progress: 2});
            }
        } else {
            this.setState({loading: false, progress: 2});
            this.playTime && clearInterval(this.playTime);
        }
    }

    _play() {
        this.playTime && clearInterval(this.playTime);
        let index = 0;
        const {progress} = this.state;
        if (progress === 2) index = 2;
        this.playTime = setInterval(() => {
            if (index === 2) {
                index = -1;
            }
            index += 1;
            this.setState({progress: index});
        }, 400);
    }

    _renderIcon = () => {
        const {isSelf, voiceLeftIcon, voiceRightIcon, ImageComponent} = this.props;
        const {progress} = this.state;
        if (isSelf) {
            if (voiceRightIcon) {
                return voiceRightIcon;
            } else {
                return <ImageComponent
                    source={progress === 0 ? require('../source/voiceRightOne.png') : progress === 1 ? require('../source/voiceRightTwo.png') : require('../source/voiceRight.png')}
                    resizeMode={'cover'}
                    style={{
                        width: 26, height: 26,
                    }}/>;
            }
        } else {
            if (voiceLeftIcon) {
                return voiceLeftIcon;
            } else {
                return <ImageComponent source={progress === 0 ? require('../source/voiceLeftOne.png') : progress === 1 ? require('../source/voiceLeftTwo.png') : require('../source/voiceLeft.png')} resizeMode={'cover'} style={{
                    width: 26, height: 26,
                }}/>;
            }
        }
    };

    componentWillUnmount() {
        this.playTime && clearInterval(this.playTime);
    }

    render() {
        const {message, messageErrorIcon, isSelf, isOpen, reSendMessage, leftMessageBackground, rightMessageBackground, voiceRightLoadingColor, voiceLeftLoadingColor, chatType, isReadStyle, showIsRead} = this.props;
        const {loading} = this.state;
        return (<View>
            <View style={[isSelf ? styles.right : styles.left]} ref={(e) => (this[`item_${this.props.rowId}`] = e)}>
                <PressableOpacity
                    disabled={isOpen}
                    activeOpacity={0.8}
                    style={{flexDirection: 'row',alignItems:'center'}}
                    collapsable={false}
                    onPress={() => {
                        this.props.savePressIndex(this.props.rowId);
                        this.props.onMessagePress('voice', parseInt(this.props.rowId), message.content.uri, message);
                    }}
                >
                    {!isSelf  && <Triangle mode={"left"} base={10} color={loading ? voiceLeftLoadingColor : leftMessageBackground} style={{marginTop: 0}} />}
                    <View
                        style={[styles.voiceArea, loading ? {
                            backgroundColor: isSelf ? voiceRightLoadingColor : voiceLeftLoadingColor,
                        } : {
                            backgroundColor: isSelf ? rightMessageBackground : leftMessageBackground,
                        }, {flexDirection:'row'}]}
                    >
                        <View style={[{width: 60 + (message.content.length > 1 ? message.content.length * 5 : 0)}, {alignItems: 'center'}, {maxWidth: width - 160}, {flexDirection: isSelf ? 'row-reverse' : 'row'}]}>
                            {!isSelf && <Text style={[{marginLeft: 8, marginRight: 2}]}>
                                {`${message.content.length}"`}
                            </Text>}
                            {this._renderIcon()}
                            {isSelf && <Text style={[{marginRight: 4}]}>
                                {`${message.content.length}"`}
                            </Text>}
                        </View>
                    </View>
                    {isSelf  && <Triangle mode={"right"} base={10} color={loading ? voiceRightLoadingColor : rightMessageBackground} style={{marginTop: 0}} />}
                </PressableOpacity>
                <View style={{alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
                    {!isSelf ? null : message.sendStatus === undefined ? null : message.sendStatus === 0 ?
                        <ActivityIndicator/> : message.sendStatus < 0 ? <PressableOpacity
                            disabled={false}
                            onPress={() => {
                                if (message.sendStatus === -2) {
                                    reSendMessage(message);
                                }
                            }}>
                            {messageErrorIcon}
                        </PressableOpacity> : null}
                </View>
            </View>
            {chatType !== 'group' && isSelf && showIsRead && (
                <Text style={[{textAlign: 'right', fontSize: 13, marginRight: 12}, isReadStyle]}>
                    {this.props.lastReadAt && this.props.lastReadAt - message.time > 0 ? '已读' : '未读'}
                </Text>)}
        </View>);
    }
}

const styles = StyleSheet.create({
    right: {
        marginLeft:5,
        flexDirection: 'row-reverse',
    }, left: {
        marginLeft:5,
        flexDirection: 'row',
    }, voiceArea: {
        paddingVertical: 8, borderRadius: 12, maxWidth: width - 160, justifyContent: 'center', minHeight: 30,
    },
});
