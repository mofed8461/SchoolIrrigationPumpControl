import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, AsyncStorage } from 'react-native';

export default function App() {
  return (<Screens />);
}

class Screens extends Component {
  state = {
    currentScreen: 'Home',
    alarms: [{h: 6, m: 30, am: true, id: 0}, {h: 10, m: 5, am: false, id: 1}],
    alarmsLimit: 5,
    currentAlarm: -1,
    connected: true,
  }

  render()
  {
    if (this.state.currentScreen == 'Home')
    {
      var addAlarmButton = null;
      if (this.state.alarms.length < this.state.alarmsLimit)
      {
        addAlarmButton = (
          <TouchableOpacity style={[styles.Input, {width: '50%'}]} onPress={() => this.addAlarm()}>
            <Text>Add More</Text>
          </TouchableOpacity>);
      }

      var items = this.state.alarms.map(data => 
      {
        var name = (data.am ? 'AM ' : 'PM ') + data.h.toString() + 'h:' + data.m.toString() + 'm ';
        var id = data.id;
        return (
        <View style={styles.hor}>
          <TouchableOpacity key={id.toString()} style={[styles.Input, {width: '50%'}]} onPress={() => this.editAlarm(id)}>
            <Text>{name}</Text>
          </TouchableOpacity>
          <TouchableOpacity key={id.toString() + 'a'} style={[styles.Input, {width: '20%'}]} onPress={() => this.removeAlarm(id)}>
            <Text>Remove</Text>
          </TouchableOpacity>
        </View>);
      });

      return (
      <View style={styles.container}>
        {items}
        {addAlarmButton}
      </View>
      );
    }
    else if (this.state.currentScreen == 'TimePicker')
    {
      var h = this.state.alarms[this.state.currentAlarm].h;
      var m = this.state.alarms[this.state.currentAlarm].m;
      var am = this.state.alarms[this.state.currentAlarm].am;
      return (
        <View style={styles.container}>
          <TimePicker H={h} M={m} AM={am} onBack={(h, m, am) => this.DoneEdit(h, m, am)} onDelete={() => this.removeAlarm(this.state.currentAlarm)}/>
          
        </View>);
    }
    return null;
  }

  editAlarm(id)
  {
    this.setState({currentAlarm: id, currentScreen: 'TimePicker'});

  }

  DoneEdit(h, m, am)
  {
    this.state.alarms[this.state.currentAlarm].h = h;
    this.state.alarms[this.state.currentAlarm].m = m;
    this.state.alarms[this.state.currentAlarm].am = am;
    this.setState({currentAlarm: -1, currentScreen: 'Home'});
  }

  addAlarm()
  {
    var newID = this.state.alarms.length;
    this.state.alarms.push({h: 9, m: 0, am: true, id: newID});
    this.editAlarm(newID);
  }

  removeAlarm(id)
  {
    this.state.alarms.splice(id, 1);
    for (var i = 0; i < this.state.alarms.length; ++i)
    {
      this.state.alarms[i].id = i;
    }
    this.setState({currentAlarm: -1, currentScreen: 'Home'});
  }


}


class TimePicker extends Component {
  state = {
    hour: 1,
    minute: 0,
    AM: false,
  }

  constructor(props){
    super(props);

    this.state = {
      hour: this.props.H,
      minute: this.props.M,
      AM: this.props.AM,
    };
  }

  componentDidMount(){
    
  }

  render() {
    return (
      <View>
        <View style={styles.hor}>
          <View style={{flexDirection: 'column', alignItems: 'center', alignContent: 'center', alignSelf: 'center'}}>
            <TouchableOpacity style={[styles.Input, {alignSelf: 'center'}]} onPress={() => this.AmPmPress()}>
              <Text>{this.state.AM ? 'AM' : 'PM'}</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.Input} onPress={() => this.AddHour(1)}>
              <Text>H+</Text>
            </TouchableOpacity>
            <TextInput editable={false}
              placeholder={'Hour'}
              style={styles.Input} 
              keyboardType={'numeric'} 
              value={this.state.hour.toString()}/>
            <TouchableOpacity style={styles.Input} onPress={() => this.AddHour(-1)}>
              <Text>H-</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.Input} onPress={() => this.AddMinute(5)}>
              <Text>M+</Text>
            </TouchableOpacity>
            <TextInput editable={false}
              placeholder={'Minute'}
              style={styles.Input} 
              keyboardType={'numeric'} 
              value={this.state.minute.toString()}/>
            <TouchableOpacity style={styles.Input} onPress={() => this.AddMinute(-5)}>
              <Text>M-</Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'column', alignItems: 'center', alignContent: 'center', alignSelf: 'center'}}>
            <TouchableOpacity style={styles.Input} onPress={ () => this.props.onBack(this.state.hour, this.state.minute, this.state.AM)}>
              <Text>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{flexDirection: 'column', alignItems: 'center', alignContent: 'center', alignSelf: 'center'}}>
            <TouchableOpacity style={[styles.Input, {width: '50%'}]} onPress={ () => this.props.onDelete()}>
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
      </View>
    );
  }
  
  AmPmPress()
  {
    this.setState(prev => (
      {
        AM: !prev.AM
      }));
  }

  AddHour(x)
  {
    this.setState(prev => (
      {
        hour: Math.max(Math.min(prev.hour + x, 12), 1)
      }));
  }

  AddMinute(x)
  {
    this.setState(prev => (
      {
        minute: Math.max(Math.min(prev.minute + x, 55), 0)
      }));
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hor:{
    flexDirection: 'row'
  },
  Input:{
    alignItems: 'center',
    width: 60,
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    padding: 10
  }
});
