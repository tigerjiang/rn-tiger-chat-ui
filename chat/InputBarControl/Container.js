import React, {PureComponent} from 'react';
import {
    Platform,
    View,
    StyleSheet, Dimensions,Animated
} from 'react-native';

const {width,height} = Dimensions.get('window');

class Container extends PureComponent {
    render() {
        const {inputOutContainerStyle, aniKeybordWillShow, isIphoneX, xHeight, inputContainerStyle, children, setInputHeight} = this.props;
        return (
            <Animated.View
                style={[
                    styles.commentBar,
                    {transform: [{translateY: aniKeybordWillShow}]},
                    {zIndex: 10},
                    inputOutContainerStyle,
                    Platform.OS === 'ios' ? {paddingBottom: isIphoneX ? xHeight : 0} : {},
                ]}
                onLayout={(e) => {
                    console.log("Container onLayout...",e.nativeEvent.layout,height);
                    setInputHeight(e.nativeEvent.layout)
                }}
            >
                <View style={[{flexDirection: 'row', alignItems: 'center', marginVertical: 8, paddingHorizontal: 10}, inputContainerStyle]}>
                    {children}
                </View>
            </Animated.View>
        );
    }
}

export default Container;

const styles = StyleSheet.create({
    commentBar: {
        flexDirection:'row',
        width: width,
        backgroundColor: '#f5f5f5',
        justifyContent: 'space-between',
        borderColor: '#ccc',
        borderTopWidth: StyleSheet.hairlineWidth,
    },
});
