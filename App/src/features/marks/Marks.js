/**
 * Created by jules on 04/02/17.
 */

import React, { Component } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import _ from "lodash";
import Accordion from 'react-native-collapsible/Accordion';
import styles from './styles.js';
import { observer } from 'mobx-react/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import IconIO from 'react-native-vector-icons/Ionicons';

import Layout from '../../shared/components/Layout';
import ModalBox from "react-native-modalbox";
import {BackDrop} from "../ranking/modal/BackDrop";

const gradeColors = {
    A: '#62c462',
    B: '#62c462',
    C: '#62c462',
    D: '#62c462',
    E: '#F44336',
    '-': '#FFD783',
};

@observer
export default class Marks extends Component {

    constructor(props) {
        super(props);

        this.nextSemester = this.nextSemester.bind(this);
        this.previousSemester = this.previousSemester.bind(this);
        this._renderContent = this._renderContent.bind(this);
    };

    _renderHeader(module) {
        const title = module.title;
        const grade = module.grade;

        return (
            <View>
                <View style={[Platform.OS === 'ios' ? styles.headerIOS : styles.headerAndroid, { borderLeftColor: gradeColors[grade] }]}>
                    <Text style={styles.moduleText}>{title}</Text>
                    <Text style={styles.gradeText}>{grade}</Text>
                </View>
                <View style={styles.subHeaderText} />
            </View>
        );
    }

    _renderContent(module) {
        const { store: { ui, marks } } = this.props;
        return (
            <View>
                {
                    module.marks.length
                        ? (
                            _.map(module.marks, (mark, i) => (
                                <TouchableOpacity
                                    key={`${mark.date}-${i}`}
                                    onPress={() => marks.selectMark(mark) || this._modal.open()}
                                >
                                    <View style={Platform.OS === 'ios' ? styles.contentIOS : styles.contentAndroid}>
                                        <Text style={styles.textContent}> {mark.title}</Text>
                                        <Text style={styles.markContent}> {mark.note}</Text>
                                        <IconMC style={styles.iconContent} size={14} name="chevron-right"/>
                                    </View>
                                </TouchableOpacity>
                            )))
                        : (

                        <View style={Platform.OS === 'ios' ? styles.contentIOS : styles.contentAndroid}>
                                <Text style={styles.textContent}> {module.title}</Text>
                                <Text style={styles.markContent}> {module.grade}</Text>
                            </View>
                        )
                }
            </View>
        );
    }

    getOrdinalNumber(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;

        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    nextSemester() {
        const { store: { marks } } = this.props;
        const { nbSemester, currentSemester } = marks;

        marks.setCurrentSemester((currentSemester >= nbSemester) ? 1 : currentSemester + 1);
    }

    previousSemester() {
        const { store: { marks } } = this.props;
        const { nbSemester, currentSemester } = marks;

        marks.setCurrentSemester((currentSemester <= 1) ? nbSemester : currentSemester - 1);
    }

    render() {
        const { store: { marks } } = this.props;
        const { marksBySemesters, currentSemester, nbSemester } = marks;
        const selectedMark = marks.getSelectedMark();

        console.log(selectedMark);

        const semesterId = (currentSemester < nbSemester)
            ? `B${currentSemester}`
            : 'Others';
        const semesterText = (currentSemester < nbSemester)
            ? `${this.getOrdinalNumber(currentSemester)} semester`
            : 'Others';

        return (
            <Layout store={this.props.store}>
                <View style={{ flex: 1, backgroundColor: '#233445' }}>
                    <View style={styles.bodyContainer}>
                        <ScrollView>
                            <Accordion
                                underlayColor="#233445"
                                sections={marksBySemesters[semesterId].slice()}
                                renderHeader={this._renderHeader}
                                renderContent={this._renderContent}
                            />
                        </ScrollView>
                        <ModalBox
                            ref={component => this._modal = component}
                            style={styles.modal}
                            backdropOpacity={0.85}
                            backdropContent={ <BackDrop message="Scroll down to quit"/> }
                        >
	                        {
		                        selectedMark && selectedMark.comment ?
                                    <View style={{margin: 15}}>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <View>
                                                <Text style={{
							                        color: '#F9F9F9',
							                        fontWeight: 'bold',
							                        fontSize: 13
						                        }}>{_.truncate(selectedMark.title, {
							                        length: 50,
							                        separator: '...'
						                        }) || "No title"}</Text>
                                                <Text style={{
							                        color: '#F9F9F9',
							                        fontStyle: 'italic',
							                        fontSize: 11
						                        }}>{selectedMark.reviser || "No reviser"}</Text>
                                            </View>
                                            <Text style={{
						                        color: '#F9F9F9',
						                        fontWeight: 'bold',
						                        fontSize: 16
					                        }}>{selectedMark.note || "N/A"}</Text>
                                        </View>
                                        <View style={{
					                        height: 1,
					                        marginTop: 10,
					                        marginBottom: 10,
					                        borderBottomWidth: 1,
					                        borderBottomColor: 'rgba(255, 255, 255, 0.1)'
				                        }}/>
                                        <Text style={{
					                        color: '#F9F9F9',
					                        fontSize: 12
				                        }}>{selectedMark.comment.replace(/(?:\r\n|\r|\n)/g, ' ') || "No comment"}</Text>
                                    </View>
			                        :
                                    <View style={{ marginTop: 60, backgroundColor: '#203040', justifyContent: 'center' }}>
                                        <IconIO
                                            name="ios-alert-outline"
                                            size={100}
                                            style={{ color: '#2c3e50',   alignSelf: 'center' }}
                                        />
                                        <Text style={{ marginTop: 10, color:'#2c3e50', alignSelf: 'center', fontSize: 15 }}>
                                            No details
                                        </Text>
                                    </View>
	                        }
                        </ModalBox>
                    </View>
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        hitSlop={{
                            top: 20,
                            bottom: 20,
                            left: 20,
                            right: 20,
                        }}
                        style={styles.headerArrow}
                        onPress={this.previousSemester}
                    >
                        <IconIO size={24} style={styles.headerIcon} name="ios-arrow-back"/>
                    </TouchableOpacity>
                    <Text style={styles.headerIcon}>
                        { semesterText }
                    </Text>
                    <TouchableOpacity
                        hitSlop={{
                            top: 20,
                            bottom: 20,
                            left: 20,
                            right: 20,
                        }}
                        style={styles.headerArrow}
                        onPress={this.nextSemester}
                    >
                        <IconIO size={24} style={styles.headerIcon} name="ios-arrow-forward"/>
                    </TouchableOpacity>
                </View>
            </View>
            </Layout>
        );
    }
};