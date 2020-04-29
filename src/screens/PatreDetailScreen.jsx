import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  TouchableNativeFeedback,
  ScrollView,
  Linking,
} from 'react-native';
import { Flag } from 'react-native-svg-flagkit';
import moment from 'moment';
import i18n from 'i18n-js';
import Colors from '../constants/Colors';
import 'moment/min/locales';
import { Ionicons } from 'expo-vector-icons';
import { I18nContext } from '../context/I18nProvider';

import 'moment/min/locales';

import countries from "i18n-iso-countries";
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/es.json"));

const PatreDetailScreen = ({ navigation }) => {
  const profile = navigation.getParam('profile');
  console.log('[profile]', profile)


  let TouchableComp = TouchableOpacity;
  if (Platform.OS === 'android' && Platform.Version >= 21) {
    TouchableComp = TouchableNativeFeedback;
  }
 

  // let date = moment(item[0].date).format('');

  return (
    <I18nContext.Consumer>
      {(value) => {
        moment.locale(value.lang)
       return(
        <View style={styles.screen}>
          <ScrollView>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}>
              <Image
                style={{ width: 100, height: 100, borderRadius: 50 }}
                resizMode="center"
                source={{ uri: `https://schoenstatt-fathers.link${profile.photo}` }}
              />
              <View style={{ padding: 15 }}>
                <Text
                  style={{
                    fontFamily: 'work-sans-semibold',
                    fontSize: 18,
                    color: Colors.onSurfaceColorPrimary,
                  }}
                >
                  {profile.fullName}
                </Text>
                <View style={{ width: '75%' }}>
                  <Text style={{ color: Colors.onSurfaceColorSecondary, fontFamily: 'work-sans' }}>
                    
                    {`${i18n.t('LAST_UPDATE')}:${
                      profile.personalInfoUpdatedOn ?  
                       
                       
                          moment.utc(profile.personalInfoUpdatedOn).format('Do MMMM YYYY')
                        
                      
                      
                      : null
                      }`}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionHeader}>{i18n.t('CONTACT_INFO')}</Text>
            <DefaultItem title="EMAIL" body={profile.email} />
            <DefaultItem title="MAIN_CELL_PHONE" body={profile.phones[0].number} />
            <DefaultItem title="HOME" body={profile.phones[1] != undefined ? profile.phones[1].number : ''} />

            <View style={{ flexDirection: 'row', width: '100%', marginVertical: 10 }}>
              <TouchableComp>
                <View
                  style={{
                    backgroundColor: Colors.primaryColor,
                    borderRadius: 5,
                    paddingHorizontal: 10,
                    width: '45%',
                    height: 50,
                    marginHorizontal: 15,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 12,
                      fontFamily: 'work-sans-bold',
                      textTransform: 'uppercase',
                      color: Colors.surfaceColorSecondary,
                    }}
                  >
                    {i18n.t('SAVE_CONTACT')}
                  </Text>
                </View>
              </TouchableComp>
              {profile.phones[0].whatsApp === true && (
                <TouchableComp
                  onPress={() => {
                    Linking.openURL(`http://api.whatsapp.com/send?phone=${profile.phones[0].number}`);
                  }}
                >
                  <Ionicons
                    name="logo-whatsapp"
                    style={{ paddingHorizontal: 20 }}
                    size={46}
                    color={Colors.primaryColor}
                  />
                </TouchableComp>
              )}
            </View>

            <Text style={styles.sectionHeader}>{i18n.t('CURRENT_HOME')}</Text>
            <DefaultItem title="FILIATION" body={profile.activeLivingSituation.filiationName} img={profile.activeLivingSituation.filiationCountry} />
            <DefaultItem title="HOME" body={profile.activeLivingSituation.houseName} img={profile.activeLivingSituation.houseCountry} />
            <DefaultItem title="RESPONSIBLE_TERRITORY" body={profile.activeLivingSituation.responsibleTerritoryName} />

            <Text style={styles.sectionHeader}>{i18n.t('PERSONAL_INFO')}</Text>

            <DefaultItem title="HOME_COUNTRY" img={profile.country} country_code={profile.country} lang={value.lang} />

            <DefaultItem title="HOME_TERRITORY" body={profile.homeTerritoryName} />
            <DefaultItem title="COURSE" body={profile.courseName} />

            <DefaultItem title="GENERATION" body={profile.generationName} />
            <DefaultItem
              title="BIRTHDAY"
              body={profile.birthDate ? moment.utc(profile.birthDate).format('Do MMMM YYYY') : null}
            />
            <DefaultItem
              title="NAMEDAY"
              body={profile.nameDay ? moment.utc(profile.nameDay).format('Do MMMM YYYY') : null}
            />
            <DefaultItem
              title="BAPTISM"
              body={profile.baptismDate ? moment.utc(profile.baptismDate).format('Do MMMM YYYY') : null}
            />
            <DefaultItem
              title="POSTULANCY_ADMITTANCE"
              body={profile.postulancyDate ? moment.utc(profile.postulancyDate).format('Do MMMM YYYY') : null}
            />
            <DefaultItem
              title="NOVITIATE_START"
              body={profile.novitiateDate ? moment.utc(profile.novitiateDate).format('Do MMMM YYYY') : null}
            />
            <DefaultItem
              title="COMMUNITY_MEMBERSHIP"
              body={
                profile.communityMembershipDate
                  ? moment.utc(profile.communityMembershipDate).format('Do MMMM YYYY')
                  : null
              }
            />
            <DefaultItem
              title="PERPETUAL_CONTRACT"
              body={
                profile.perpetualContractDate
                  ? moment.utc(profile.perpetualContractDate).format('Do MMMM YYYY')
                  : null
              }
            />
            <DefaultItem
              title="DIACONATE_ORDINATION"
              body={profile.deaconDate ? moment.utc(profile.deaconDate).format('Do MMMM YYYY') : null}
            />
            <DefaultItem
              title="PRIESTLY_ORDINATION"
              body={profile.priestDate ? moment.utc(profile.priestDate).format('Do MMMM YYYY') : null}
            />

            <Text style={styles.sectionHeader}>{i18n.t('PAST_HOMES')}</Text>
            {profile.livingSituations.map((pastHomes) => (
              <View>
                <DefaultItem title="FILIATION" body={pastHomes.filiationName} img={pastHomes.filiationCountry} />
                <DefaultItem title="HOME" body= {pastHomes.houseName} img={pastHomes.houseCountry} />
                <DefaultItem title="RESPONSIBLE_TERRITORY" body= {pastHomes.responsibleTerritoryName} />
                <DefaultItem title="START_DATE" date={pastHomes.startDate} lang={value.lang}/>
                <DefaultItem title="END_DATE" date={pastHomes.endDate} lang={value.lang} />
                <Text style={styles.sectionHeader}></Text>
              </View>

            ))}

          </ScrollView>
        </View>
      )}
      }
    </I18nContext.Consumer>

  );
};

PatreDetailScreen.navigationOptions = (navigationData) => {
  const profile = navigationData.navigation.getParam('profile');
  return {
    headerTitle: profile.fullName,
  };
};

const DefaultItem = ({
  title, body, selected, img, country_code, lang, date
}) => {
  let TouchableComp = TouchableOpacity;
  let formatedDate;
  if (Platform.OS === 'android' && Platform.Version >= 21) {
    TouchableComp = TouchableNativeFeedback;
  }

  if ( date ) {
    moment.locale(lang);
    formatedDate = moment.utc(date ).format('dddd,  Do MMMM YYYY');
  }
  

  return (
    <TouchableComp
      onPress={() => {
        console.log('apretado');
      }}
    >
      <View
        style={{
          padding: 15,
          backgroundColor: Colors.surfaceColorSecondary,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text style={styles.listItemTitle}>{i18n.t(title)}</Text>
          { country_code &&
            <Text style={styles.listItemBody}>{countries.getName(country_code, lang)}</Text>
           }
          { date &&
            <Text style={styles.listItemBody}>{formatedDate}</Text>
            }

          { body && 
            <Text style={styles.listItemBody}>{body}</Text>
          }
        </View>  
        {img && (
          <View>
            <Flag id={img} size={0.2} />
          </View>
        )}
      </View>
    </TouchableComp>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 0,
    backgroundColor: Colors.surfaceColorPrimary,
  },
  sectionHeader: {
    fontFamily: 'work-sans-medium',
    color: Colors.onSurfaceColorPrimary,
    fontSize: 11,
    padding: 15,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  listItem: {
    backgroundColor: Colors.surfaceColorPrimary,
    paddingVertical: 15,
  },
  listItemTitle: {
    fontFamily: 'work-sans-semibold',
    fontSize: 18,
    color: Colors.onSurfaceColorPrimary,
  },
  listItemBody: {
    fontFamily: 'work-sans',
    fontSize: 15,
    color: Colors.onSurfaceColorPrimary,
  },
});

export default PatreDetailScreen;