import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, AsyncStorage } from 'react-native';
import { getAppLoadingLifecycleEmitter } from 'expo/build/launch/AppLoading';

export default function App() {
  return (<Screens />);
}

class Screens extends Component {
  state = {
    currentScreen: 'Home',
    alarms: [{h: 6, m: 30, am: true, id: 0}, {h: 10, m: 5, am: false, id: 1}],
    alarmsLimit: 3,
    currentAlarm: -1,
    connected: false,
    humidityUpperLimit: '60',
    tempLowerLimit: '5',
    autoStartForExtremeValues: false,
    humidityLowerLimit: '30',
    tempUpperLimit: '40',
    currentTemp: 20,
    currentHumidity: 30,
    currentState: false,
    timerID: null,
    timeout: '5',
  }

  componentDidMount()
  {
    // this.startTimer();
  }

  ffetch(url)
  {
    console.log('requesting: ' + url);
    return fetch(url);
    // return fetch(url, {
      // method: 'GET',
      // headers: {
      //   // Accept: 'application/json',
      //   // 'Content-Type': 'application/json',
      // },
      // body: JSON.stringify({}),
    // });
  }

  startTimer()
  {
    var timerID = setInterval(() => {
      console.log('loop');
      this.ffetch('http://192.168.4.1/c')
      .then((response) => response.text())
      .then((responseJson) => {
        console.log(JSON.stringify(responseJson));
        var success = (responseJson == '1234');
        this.setState({connected: success});
        return success;
      })
      .then((success) =>  {
        if (success)
        {
          console.log('fetching temp');

          return this.ffetch('http://192.168.4.1/t');
        }
        else
        {
          throw 'failed to connect';
        }
      })
      .then((response) => response.text())
      .then((temp) => {
        console.log(JSON.stringify(temp));

        console.log('fetching humidity')
        this.setState({currentTemp: temp});
        return this.ffetch('http://192.168.4.1/h');
      })
      .then((response) => response.text())
      .then((humidity) => {
        console.log(JSON.stringify(humidity));

        this.setState({currentHumidity: humidity});
        return this.logic();
      })
      .catch((error) => {

        console.log('error: ' + JSON.stringify(error));

        this.setState({connected: false});
      });

    }, 10000);

    this.setState({timerID: timerID});
  }

  stopTimer()
  {
    clearInterval(this.state.timerID);
    this.setState({timerID: null});
  }

  StartStopTimer()
  {
    if (this.state.timerID == null) 
      this.startTimer(); 
    else 
      this.stopTimer();
  }

  render()
  {
    if (this.state.currentScreen == 'Home')
    {

      var StartStopTimer = null;
      {
        StartStopTimer = (
          <View style={styles.hor}>
            <TouchableOpacity style={[styles.Input, {width: '70%', alignSelf: 'center'}]} onPress={() => this.StartStopTimer()}>
              <Text>{this.state.timerID == null ? 'System is off' : 'System is on'}</Text>
            </TouchableOpacity>
          </View>
        );
      }

      var status = [(
        <Text key={'status'} style={styles.sText}>Status: {this.state.connected? 'connected' : 'not connected'}</Text>
      )];

      {
        var otherStyle = null;
        if (!this.state.connected)
        {
          otherStyle = styles.hidden;
        }

        status.push(
          <Text key={'temp'} style={[styles.sText, otherStyle]}>Temp: {this.state.currentTemp}</Text>
        );
        status.push(
          <Text key={'hum'} style={[styles.sText, otherStyle]}>Humidity: {this.state.currentHumidity}</Text>
        );
        status.push(
          <Text key={'pump'} style={[styles.sText, otherStyle]}>Pump: {this.state.currentState? 'On' : 'Off'}</Text>
        );
      }

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
        <View style={styles.hor} key={id.toString() + 'a'}>
          <TouchableOpacity key={id.toString() + 'b'} style={[styles.Input, {width: '50%'}]} onPress={() => this.editAlarm(id)}>
            <Text key={id.toString() + 'c'}>{name}</Text>
          </TouchableOpacity>
          <TouchableOpacity key={id.toString() + 'd'} style={[styles.Input, {width: '20%'}]} onPress={() => this.removeAlarm(id)}>
            <Text key={id.toString() + 'e'}>Remove</Text>
          </TouchableOpacity>
        </View>);
      });

      var hideStyle = this.state.autoStartForExtremeValues ? null : styles.hidden;

      return (
      <View style={styles.container}>
        {status}
        {StartStopTimer}
        {items}
        {addAlarmButton}
        <View style={styles.hor}>
          <Text style={styles.Text}>Irrigation for</Text>
          <TextInput style={styles.Input} value={this.state.timeout} onChangeText={(val) => this.setTimeout(val)}/>
          <Text style={styles.Text}>s</Text>
        </View>
        <View style={styles.hor}>
          <Text style={styles.Text}>Humidity Upper Limit</Text>
          <TextInput style={styles.Input} value={this.state.humidityUpperLimit} onChangeText={(val) => this.setHumidityUpperLimit(val) }/>
          <Text style={styles.Text}>%</Text>
        </View>
        <View style={styles.hor}>
          <Text style={styles.Text}>Temp. Lower Limit</Text>
          <TextInput style={styles.Input} value={this.state.tempLowerLimit} onChangeText={(val) => this.setTempLowerLimit(val) }/>
          <Text style={styles.Text}>C</Text>
        </View>
        <View style={styles.hor}>
          <Text style={styles.Text}>Auto Start For Extreme Values</Text>
          <TouchableOpacity style={[styles.Input, {alignSelf: 'center'}]} onPress={() => this.autoStartPress()}>
            <Text>{this.state.autoStartForExtremeValues ? 'On' : 'Off'}</Text>
          </TouchableOpacity>
        </View>

        <View>
            <View style={styles.hor}>
              <Text style={styles.Text}>Humidity Lower Limit</Text>
              <TextInput style={[styles.Input, hideStyle]} editable={this.state.autoStartForExtremeValues} value={this.state.humidityLowerLimit} onChangeText={(val) => this.setHumidityLowerLimit(val) }/>
              <Text style={styles.Text}>%</Text>
            </View>
            <View style={styles.hor}>
              <Text style={styles.Text}>Temp. Upper Limit</Text>
              <TextInput style={[styles.Input, hideStyle]} editable={this.state.autoStartForExtremeValues} value={this.state.tempUpperLimit} onChangeText={(val) => this.setTempUpperLimit(val) }/>
              <Text style={styles.Text}>C</Text>
            </View>
          </View>
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

  autoStartPress()
  {
    this.setState(prev => (
      {
        autoStartForExtremeValues: !prev.autoStartForExtremeValues
      }));
  }

  setTimeout(val)
  {
    if (!val && val != '0')
      val = '';
    this.setState({timeout: val});
  }

  setHumidityUpperLimit(val)
  {
    if (!val && val != '0')
      val = '';
    this.setState({humidityUpperLimit: val});
  }

  setTempLowerLimit(val)
  {
    if (!val && val != '0')
      val = '';
    this.setState({tempLowerLimit: val});
  }

  setHumidityLowerLimit(val)
  {
    if (!val && val != '0')
      val = '';
    this.setState({humidityLowerLimit: val});
  }

  setTempUpperLimit(val)
  {
    if (!val && val != '0')
      val = '';
    this.setState({tempUpperLimit: val});
  }

  isMatchTime(alarm)
  {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var am = true;
    if (h > 12)
    {
      am = false;
      h -= 12;
    }

    if (alarm.am == am && alarm.h == h && Math.abs(alarm.m - m) < 5)
    {
      return true;
    }
    return false;
  }

  logic()
  {
    var pumpTime = false;
    for (var i = 0; i < this.state.alarms.length; i++)
    {
      if (this.isMatchTime(this.state.alarms[i]))
      {
        pumpTime = true;
        break;
      }
    }

    if (pumpTime)
    {
      if (parseFloat(this.state.currentHumidity) < parseFloat(this.state.humidityUpperLimit) || parseFloat(this.state.currentTemp) > parseFloat(this.state.tempLowerLimit))
      {
        this.ffetch('http://192.168.4.1/on')
        .then((response) => response.text())
        .then((responseJson) => {
          this.setState({currentState: true});
          setTimeout(() => {
            this.setState({currentState: false});
            this.ffetch('http://192.168.4.1/off');
          }, parseFloat(this.state.timeout) * 1000);
        });
      }
    }
    else if (this.state.autoStartForExtremeValues)
    { 
      if (parseFloat(this.state.currentHumidity) > parseFloat(this.state.humidityLowerLimit) && parseFloat(this.state.currentTemp) < parseFloat(this.state.tempUpperLimit))
      {
        this.ffetch('http://192.168.4.1/on')
        .then((response) => response.text())
        .then((responseJson) => {
          this.setState({currentState: true});
          setTimeout(() => {
            this.setState({currentState: false});
            this.ffetch('http://192.168.4.1/off');
          }, parseFloat(this.state.timeout) * 1000);
        });
      }
    }
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
    marginTop: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    // justifyContent: 'center',
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
  },
  Text:{
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: 10,
    margin: 10,
    padding: 10
  },
  sText:{
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: 10,
    margin: 2,
    padding: 2
  },
  hidden: {
    opacity: 0.3,
  }
  
});
