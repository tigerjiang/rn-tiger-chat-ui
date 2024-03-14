import React, {PureComponent} from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Platform,
    Dimensions,
    Animated,
    TouchableOpacity,
    Pressable,
    StatusBar,
} from 'react-native';
import ViewPagerAndroidContainer from '../android-container';
import ViewPagerAndroid from 'react-native-pager-view';
import Control from './control';
import {PressableOpacity} from 'react-native-pressable-opacity';
import PagerView from 'react-native-pager-view';
const {width, height} = Dimensions.get('window');
const AnimatedViewPagerAndroid = Animated.createAnimatedComponent(ViewPagerAndroid);

export default class EmojiPanel extends PureComponent {
  constructor(props) {
    super(props);
    const {allPanelHeight, isIphoneX, iphoneXBottomPadding} = props;
    this.totalHeight = allPanelHeight + (isIphoneX ? iphoneXBottomPadding : 0);
    this.state = {
      pageIndex: 0,
    };
    this.total = 0;
  }

  switchComponent(e) {
    const {position, offset} = e.nativeEvent;
    if (offset === 0) {
      this.setState({pageIndex: position});
    }
  }

  render() {
    const {panelContainerHeight, aniEmojiHeight,emojiShow, ImageComponent} = this.props;
    const ContainerComponent = Platform.select({ios: ScrollView, android: ViewPagerAndroid});
    this.total = 0;
    return (
        <Animated.View style={[styles.container, {
          position: 'absolute',
          height: panelContainerHeight,
          backgroundColor: '#f5f5f5',
          transform: [{translateY: aniEmojiHeight}],
          opacity: 1,
          display: emojiShow ? 'flex':'none'
        }]}
        >
          <ViewPagerAndroidContainer style={{height: panelContainerHeight, width}}>
            <AnimatedViewPagerAndroid
                ref={e => {
                  this.scroll = e;
                }}
                onScroll={(e) => this.switchComponent(e)}
                onPageScroll={(e) => this.switchComponent(e)}
                horizontal
                style={{flex: 1,marginTop: StatusBar.currentHeight + 10}}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                lazy={true}
                automaticallyAdjustContentInsets={false}
                scrollEventThrottle={200}
            >
              {
                this.props.emojiList.map((item, index) => {
                      this.total += 1;
                      return <View key={index} style={{
                        width,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        paddingHorizontal: 15,
                      }}>
                        {
                          item.map((list, i) =>
                              <PressableOpacity
                                  key={i}
                                  style={{
                                    width: (width - 30) / 8,
                                    height: 45,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom:8
                                  }}
                                  onPress={() => {
                                    this.props.onPress(list);
                                  }}
                              >
                                <ImageComponent
                                    source={{uri: list.url}}
                                    resizeMode="cover" style={{width: 40, height: 40}}
                                />
                              </PressableOpacity>,
                          )
                        }
                      </View>;
                    },
                )
              }
            </AnimatedViewPagerAndroid>
            <View style={{height:40}}>
              <Control style={{bottom: 10}} index={this.state.pageIndex} total={this.total}/>
            </View>
          </ViewPagerAndroidContainer>
        </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderTopWidth: 0,
    borderColor: '#ccc',
    overflow: 'hidden'
  }
})
