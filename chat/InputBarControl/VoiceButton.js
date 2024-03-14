import React, {PureComponent} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Platform,
    Dimensions,
} from 'react-native';
import {PanGestureHandler, State, TapGestureHandler, GestureDetector, Gesture} from 'react-native-gesture-handler';

const {height} = Dimensions.get('window');


const VoiceButton = ({voiceStart,voiceEnd,isVoiceEnd, changeVoiceStatus, inputHeightFix, pressOutText, pressInText}) => {
    const gesture = Gesture.LongPress()
        .shouldCancelWhenOutside(false)
        .maxDistance(height)
        .minDuration(100)
        .runOnJS(true)
        .onBegin(() => {
            console.log('gesture begin');
        })
        .onStart(() => {
            console.log('gesture start');
            voiceStart();
            console.log("gesture start ....");
        })
        .onTouchesUp(() => {
            console.log("gesture onTouchesUp");
            voiceEnd();
        })
        .onTouchesCancelled(() => {
            console.log('gesture onTouchesCancelled');
        })
        .onTouchesMove((event, stateManager) => {
            if(event.changedTouches[0].y < 0){
                //手势上移了
                changeVoiceStatus(false);
            }else{
                changeVoiceStatus(true);
            }
        })
        .onEnd((e,success) => {
            console.log('gesture end',e,success);
        })
        .onFinalize((e,success) => {
            console.log('gesture finalize',e,success);
        });
    return (
        <GestureDetector gesture={gesture}>
            <View style={{borderRadius: 18, backgroundColor: isVoiceEnd ? '#bbb' : '#f5f5f5'}}>
                <View style={[styles.container, {height: 35 + inputHeightFix}]}>
                    <Text style={styles.text}>{isVoiceEnd ? `${pressOutText}` : `${pressInText}`}</Text>
                </View>
            </View>
        </GestureDetector>
    );


};

export default VoiceButton;

const styles = StyleSheet.create({
    container: {
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
});
