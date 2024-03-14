import React, {PureComponent} from 'react';
import {
    View, TouchableOpacity, ActivityIndicator, Platform, StyleSheet, Dimensions, Text, Pressable,
} from 'react-native';
import {PressableOpacity} from 'react-native-pressable-opacity';
import {changeEmojiText} from './utils';
import Triangle from "@react-native-toolkit/triangle";
const {width} = Dimensions.get('window');

export default class TextMessage extends PureComponent {
    render() {
        const {isSelf, message, messageErrorIcon, onMessagePress, views, isOpen, rightMessageBackground, leftMessageBackground, reSendMessage, chatType, isReadStyle, showIsRead, ImageComponent} = this.props;
        return (<View style={[isSelf ? styles.right : styles.left]}>
                    <View style={{flexDirection:'row'}}>
                        {!isSelf && <Triangle mode={"left"} base={10} color={leftMessageBackground} style={{marginTop: 16}} />}
                        <View style={[styles.container, {
                            backgroundColor: isSelf ? rightMessageBackground : leftMessageBackground,
                        }]}>
                            {views}
                        </View>
                        {isSelf && <Triangle mode={"right"} base={10} color={rightMessageBackground} style={{marginTop: 16}} />}
                    </View>
            </View>);
    }
}
const styles = StyleSheet.create({
    container:{
        flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 15, maxWidth: width - 160, minHeight: 20,
    }, right: {
        marginLeft:5,
        flexDirection: 'row-reverse',
    }, left: {
        marginLeft:5,
        flexDirection: 'row',
    },
});
