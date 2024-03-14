import React, {PureComponent} from 'react';
import {View, StyleSheet, Dimensions, Animated} from 'react-native';

const {width, height} = Dimensions.get('window');

export default class PlusPanel extends PureComponent {

    render() {
        const {panelContainerHeight, aniPlusHeight, panelHeight, panelShow, panelContainerStyle} = this.props;
        return (
            <Animated.View
                style={{
                    opacity: 1,
                    position: 'absolute',
                    height: panelContainerHeight,
                    transform: [{translateY: aniPlusHeight}],
                    backgroundColor: '#f5f5f5',
                    width,
                    display: panelShow ? 'flex' : 'none',
                }}
                renderToHardwareTextureAndroid
            >
                <View style={[styles.container, panelContainerStyle]}>
                    {this.props.panelSource.map((item, index) =>
                        this.props.renderPanelRow(item, index))
                    }
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderTopWidth: 0,
        borderColor: '#ccc',
        paddingHorizontal: 15,
        paddingTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});
