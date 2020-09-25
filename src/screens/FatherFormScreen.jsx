import React, { Component, Fragment } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputWithFormik from '../components/InputWithFormik';
import HeaderButton from '../components/HeaderButton';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import * as Network from 'expo-network';
import i18n from 'i18n-js';
import SnackBar from '../components/SnackBar';
import Colors from '../constants/Colors';
import { NavigationEvents } from 'react-navigation';
import { getPerson, getPersonByUser, getInterfaceData, updateFatherForm } from '../api';
import Button from '../components/Button';
import SwitchWithFormik from '../components/SwitchWithFormik';
import Select from '../components/Select';

const widthBtn = Platform.OS == 'android' ? '45%' : '100%';
const styles = StyleSheet.create({
  snackError: {
    backgroundColor: Colors.secondaryColor,
  },
  btnContainer: {
    backgroundColor: 'white',
    borderColor: Colors.primaryColor,
    borderRadius: 5,
    borderWidth: 2,
    paddingHorizontal: 10,
    width: widthBtn,
    height: 50,
    marginHorizontal: 15,
    justifyContent: 'center',
    marginVertical: 10,
  },
  btnText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'work-sans-bold',
    textTransform: 'uppercase',
    color: Colors.primaryColor,
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingRight: 20,
    justifyContent: 'space-between',
  },
  screen: {
    backgroundColor: Colors.surfaceColorPrimary,
    flex: 1,
    justifyContent: 'center',
  },
  select: {
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  selectAndroid: {
    width: '100%',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

class FatherFormScreen extends Component {
  state = {
    father: {},
    loading: true,
    updateFields: [],
    keyboardAV: '',
  };
  async componentDidMount() {
    this.setState({ loading: true });
    await this.loadPerson();
  }

  loadInterfaceData = async (father) => {
    const status = await Network.getNetworkStateAsync();
    if (status.isConnected == true) {
      getInterfaceData().then((response) => {
        const updatePermRole = father.updatePermissionForCurrentUser;
        const personFieldsByUpdatePermission = response.data.result.personFieldsByUpdatePermission;
        let updateRoles = Object.keys(personFieldsByUpdatePermission);
        const arrayOfRoles = updateRoles.map((rol) => {
          return personFieldsByUpdatePermission[rol];
        });
        const accumulatedFieldsPerRol = arrayOfRoles.map((rol, index) => {
          return rol;
        });
        let index = updateRoles.indexOf(updatePermRole);
        const updateFields = accumulatedFieldsPerRol[index];

        response.personPhoneLabels;

        const regex = {
          facebookUrlRegex:
            '(?:(?:http|https)://)?(?:www.)?facebook.com/(?:(?:w)*#!/)?(?:pages/)?(?:[?w-]*/)?(?:profile.php?id=(?=d.*))?([w-]*)?',
          instagramUserRegex:
            response.data.result.instagramUserRegex &&
            response.data.result.instagramUserRegex.substring(1, response.data.result.instagramUserRegex.length - 1),
          skypeUserRegex:
            response.data.result.skypeUserRegex &&
            response.data.result.skypeUserRegex.substring(1, response.data.result.skypeUserRegex.length - 1),
          slackUserRegex:
            response.data.result.slackUserRegex &&
            response.data.result.slackUserRegex.substring(1, response.data.result.slackUserRegex.length - 1),
          twitterUserRegex:
            response.data.result.twitterUserRegex &&
            response.data.result.twitterUserRegex.substring(1, response.data.result.twitterUserRegex.length - 1),
          phoneNumberRegex:
            response.data.result.phoneNumberRegex &&
            response.data.result.phoneNumberRegex.substring(1, response.data.result.phoneNumberRegex.length - 1),
          //twitterUserRegex:response.data.result.twitterUserRegex && response.data.result.twitterUserRegex.substring(1,response.data.result.twitterUserRegex.length -1),
        };
        this.setState({ fieldsPerm: accumulatedFieldsPerRol, regex: regex, loading: false, updateFields });
      });
    }
  };

  loadPerson = async () => {
    this.setState({ loading: true });
    const { navigation } = this.props;
    const status = await Network.getNetworkStateAsync();
    if (status.isConnected === true) {
      let fatherId = this.props.navigation.getParam('fatherId');
      if (!fatherId) {
        fatherId = await AsyncStorage.getItem('fatherId');
        fatherId = JSON.parse(fatherId);
      } else {
        AsyncStorage.setItem('fatherId', JSON.stringify(fatherId));
      }

      if (fatherId) {
        getPerson(fatherId, 'all').then((response) => {
          const father = response.data.result;
          this.setState({ father });

          this.loadInterfaceData(response.data.result);
        });
      }
    } else {
      this.setState({ loading: false, visible: true, snackMsg: i18n.t('GENERAL.NO_INTERNET') });
    }
  };

  render() {
    let TouchableComp = TouchableOpacity;
    if (Platform.OS === 'android' && Platform.Version >= 21) {
      TouchableComp = TouchableNativeFeedback;
    }

    const { father, updateFields, regex, loading } = this.state;
    let { navigation } = this.props;
    let validationSchema;
    if (regex) {
      validationSchema = Yup.object().shape({
        ...(updateFields.indexOf('firstName') != -1
          ? { firstName: Yup.string().required().max(50, i18n.t('FATHER_EDIT.LESSTHAN50')) }
          : null),
        ...(updateFields.indexOf('lastName') != -1
          ? { lastName: Yup.string().required().max(50, i18n.t('FATHER_EDIT.LESSTHAN50')) }
          : null),
        ...(updateFields.indexOf('friendlyFirstName') != -1
          ? { friendlyFirstName: Yup.string().required().max(50, i18n.t('FATHER_EDIT.LESSTHAN50')) }
          : null),
        ...(updateFields.indexOf('friendlyFirstName') != -1
          ? { friendlyFirstName: Yup.string().required().max(70, i18n.t('FATHER_EDIT.LESSTHAN70')) }
          : null),
        ...(updateFields.indexOf('friendlyLastName') != -1
          ? { friendlyLastName: Yup.string().required().max(50, i18n.t('FATHER_EDIT.LESSTHAN50')) }
          : null),
        ...(updateFields.indexOf('email') != -1
          ? { email: Yup.string().email().max(70, i18n.t('FATHER_EDIT.LESSTHAN70')).nullable() }
          : null),
        ...(updateFields.indexOf('email2') != -1
          ? { email2: Yup.string().email().max(70, i18n.t('FATHER_EDIT.LESSTHAN70')).nullable() }
          : null),
        ...(updateFields.indexOf('cellphone') != -1
          ? { email2: Yup.string().matches(regex.phoneNumberRegex).nullable() }
          : null),
        ...(updateFields.indexOf('slackUser') != -1
          ? { slackUser: Yup.string().matches(regex.slackUserRegex).nullable() }
          : null),
        ...(updateFields.indexOf('instagramUser') != -1
          ? { instagramUser: Yup.string().matches(regex.instagramUserRegex).nullable() }
          : null),
        ...(updateFields.indexOf('twitterUser') != -1
          ? { twitterUser: Yup.string().matches(regex.twitterUserRegex).nullable() }
          : null),
        ...(updateFields.indexOf('skypeUser') != -1
          ? { skypeUser: Yup.string().matches(regex.skypeUserRegex).nullable() }
          : null),
        ...(updateFields.indexOf('phone1') != -1
          ? { phone1: Yup.string().matches(regex.phoneNumberRegex).nullable() }
          : null),
        ...(updateFields.indexOf('phone2') != -1
          ? { phone2: Yup.string().matches(regex.phoneNumberRegex).nullable() }
          : null),
        ...(updateFields.indexOf('phone3') != -1
          ? { phone2: Yup.string().matches(regex.phoneNumberRegex).nullable() }
          : null),
        ...(updateFields.indexOf('facebookUrl') != -1
          ? { facebookUrl: Yup.string().matches(regex.facebookUrlRegex).nullable() }
          : null),
      });
    }

    return (
      <>
        <NavigationEvents
          onDidFocus={async () => {
            console.log('DidFocus');
            await this.loadPerson();
          }}
        />
        <SafeAreaView style={styles.screen}>
          {!loading ? (
            <>
              <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? this.state.keyboardAV : 'height'}>
                <ScrollView>
                  <View style={{ paddingHorizontal: 15, marginVertical: 30, width: '80%' }}>
                    <Text
                      style={{
                        fontFamily: 'work-sans-semibold',
                        fontSize: 24,
                        color: Colors.primaryColor,
                      }}
                    >
                      {i18n.t('FATHER_EDIT.EDIT')}
                    </Text>
                  </View>
                  <Formik
                    initialValues={{
                      ...(updateFields.indexOf('firstName') != -1 && !!father.firstName
                        ? { firstName: father.firstName }
                        : { firstName: null }),
                      ...(updateFields.indexOf('lastName') != -1 && !!father.lastName
                        ? { lastName: father.lastName }
                        : { lastName: null }),
                      ...(updateFields.indexOf('friendlyFirstName') != -1 && !!father.friendlyFirstName
                        ? { friendlyFirstName: father.friendlyFirstName }
                        : { friendlyFirstName: null }),
                      ...(updateFields.indexOf('friendlyLastName') != -1 && !!father.friendlyLastName
                        ? { friendlyLastName: father.friendlyLastName }
                        : { friendlyLastName: null }),
                      ...(updateFields.indexOf('email') != -1 && !!father.email
                        ? { email: father.email }
                        : { email: null }),
                      ...(updateFields.indexOf('email2') != -1 && !!father.email2
                        ? { email2: father.email2 }
                        : { email2: null }),
                      ...(updateFields.indexOf('cellPhone') != -1 && !!father.cellphone
                        ? { cellphone: father.cellphone }
                        : { cellphone: null }),
                      ...(updateFields.indexOf('cellPhoneHasWhatsApp') != -1 && !!father.cellPhoneHasWhatsApp
                        ? { cellPhoneHasWhatsApp: !!father.cellPhoneHasWhatsApp }
                        : { cellPhoneHasWhatsApp: null }),
                      ...(updateFields.indexOf('slackUser') != -1 && !!father.slackUser
                        ? { slackUser: father.slackUser }
                        : { slackUser: null }),
                      ...(updateFields.indexOf('instagramUser') != -1 && !!father.instagramUser
                        ? { instagramUser: father.instagramUser }
                        : { instagramUser: null }),
                      ...(updateFields.indexOf('twitterUser') != -1 && !!father.twitterUser
                        ? { twitterUser: father.twitterUser }
                        : { twitterUser: null }),
                      ...(updateFields.indexOf('facebookUrl') != -1 && !!father.facebookUrl
                        ? { facebookUrl: father.facebookUrl }
                        : { facebookUrl: null }),
                      ...(updateFields.indexOf('skypeUser') != -1 && !!father.skypeUser
                        ? { skypeUser: father.skypeUser }
                        : { skypeUser: null }),
                      ...(updateFields.indexOf('phone1') != -1 && !!father.phone1
                        ? { phone1: father.phone1 }
                        : { phone1: null }),
                      ...(updateFields.indexOf('phone2') != -1 && !!father.phone2
                        ? { phone2: father.phone2 }
                        : { phone2: null }),
                      ...(updateFields.indexOf('phone3') != -1 && !!father.phone2
                        ? { phone3: father.phone3 }
                        : { phone3: null }),
                    }}
                    onSubmit={(values) => {
                      this.setState({ loading: true });
                      console.log(values);
                      //this.setState({loading:true})
                      updateFatherForm(this.state.father.personId, values).then(
                        () => {
                          this.loadPerson();
                          this.setState(this.setState({ snackMsg: i18n.t('GENERAL.EDIT_SUCCESS'), visible: true }));
                        },
                        () => {
                          this.setState(
                            this.setState({ snackMsg: i18n.t('GENERAL.ERROR'), visible: true, loading: false }),
                          );
                        },
                      );
                    }}
                    enableReinitialize
                    validationSchema={validationSchema}
                  >
                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                      <Fragment>
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('firstName') != -1}
                          label={i18n.t('FATHER_EDIT.FIRSTNAME')}
                          name="firstName"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('lastName') != -1}
                          label={i18n.t('FATHER_EDIT.LASTNAME')}
                          name="lastName"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('friendlyFirstName') != -1}
                          label={i18n.t('FATHER_EDIT.FRIENDLY_FIRSTNAME')}
                          name="friendlyFirstName"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('friendlyLastName') != -1}
                          label={i18n.t('FATHER_EDIT.FRIENDLY_LASTNAME')}
                          name="friendlyLastName"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />

                        <InputWithFormik
                          hasPerm={updateFields.indexOf('friendlyLastName') != -1}
                          label={i18n.t('FATHER_EDIT.FRIENDLY_LASTNAME')}
                          name="friendlyLastName"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />

                        <InputWithFormik
                          hasPerm={updateFields.indexOf('email') != -1}
                          label={i18n.t('FATHER_EDIT.EMAIL')}
                          name="email"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />

                        <InputWithFormik
                          hasPerm={updateFields.indexOf('email2') != -1}
                          label={i18n.t('FATHER_EDIT.EMAIL2')}
                          name="email2"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('cellPhone') != -1}
                          label={i18n.t('FATHER_EDIT.CELLPHONE')}
                          name="cellphone"
                          mode="outlined"
                          keyboardType="numeric-pad"
                          selectionColor={Colors.primaryColor}
                        />
                        <SwitchWithFormik
                          hasPerm={updateFields.indexOf('cellPhoneHasWhatsApp') != -1}
                          label={i18n.t('FATHER_EDIT.CELLPHONE_HAS_WA')}
                          name="cellPhoneHasWhatsApp"
                          color={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('phone1') != -1}
                          label={i18n.t('FATHER_EDIT.PHONE1')}
                          placeholder={'+1 262 473-4782'}
                          name="phone1"
                          mode="outlined"
                          keyboardType="number-pad"
                          selectionColor={Colors.primaryColor}
                        />
                        {/* {Platform.OS === 'android' ? (
                          <Select
                            style={styles.selectAndroid}
                            elements={lng}
                            value={value.lang}
                            valueChange={value.changeLang}
                          />
                        ) : (
                          <View style={styles.pickerContainer}>
                            <Text style={styles.text}>{i18n.t('SETTINGS.LANGUAGE')}</Text>
                            <Select
                              style={styles.select}
                              elements={lng}
                              value={value.lang}
                              valueChange={value.changeLang}
                            />
                          </View>
                        )} */}
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('phone2') != -1}
                          label={i18n.t('FATHER_EDIT.PHONE2')}
                          placeholder={'+1 262 473-4782'}
                          name="phone2"
                          mode="outlined"
                          keyboardType="number-pad"
                          underlineColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('phone3') != -1}
                          label={i18n.t('FATHER_EDIT.PHONE3')}
                          placeholder={'+1 262 473-4782'}
                          name="phone3"
                          mode="outlined"
                          keyboardType="number-pad"
                          underlineColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('instagramUser') != -1}
                          label={i18n.t('FATHER_EDIT.INSTAGRAM')}
                          name="instagramUser"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('slackUser') != -1}
                          label={i18n.t('FATHER_EDIT.SLACK')}
                          name="slackUser"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('twitterUser') != -1}
                          label={i18n.t('FATHER_EDIT.TWITTER')}
                          name="twitterUser"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('facebookUrl') != -1}
                          label={i18n.t('FATHER_EDIT.FACEBOOK')}
                          placeholder={'https://www.facebook.com/my_name'}
                          name="facebookUrl"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                        />
                        <InputWithFormik
                          hasPerm={updateFields.indexOf('skypeUser') != -1}
                          label={i18n.t('FATHER_EDIT.SKYPE')}
                          name="skypeUser"
                          mode="outlined"
                          selectionColor={Colors.primaryColor}
                          onPress
                        />

                        {/* //<InputWithFormik hasPerm={updateFields.indexOf('') != -1} label={i18n.t("FATHER_EDIT.FACEBOOK")} placeholder = {'https://www.facebook.com/'} name = "facebookUrl" /> */}
                        <View style={styles.buttonsContainer}>
                          {/*   { updateFields.indexOf('living')} */}

                          {father && father.allowUpdateLivingSituation && (
                            <Button
                              onPress={() => {
                                navigation.navigate('LivingSituationForm', {
                                  livingSituation: father.activeLivingSituation ? father.activeLivingSituation : null,
                                  personId: father ? father.personId : null,
                                });
                              }}
                            >
                              <View style={styles.btnContainer}>
                                <Text style={styles.btnText}>{i18n.t('FATHER_EDIT.EDIT_LIVING')}</Text>
                              </View>
                            </Button>
                          )}

                          <Button onPress={handleSubmit}>
                            <View style={styles.btnContainer}>
                              <Text style={styles.btnText}>{i18n.t('FATHER_EDIT.SAVE')}</Text>
                            </View>
                          </Button>
                        </View>
                      </Fragment>
                    )}
                  </Formik>
                  <SnackBar visible={this.state.visible} onDismiss={() => this.setState({ visible: false })}>
                    {this.state.snackMsg}
                  </SnackBar>
                </ScrollView>
              </KeyboardAvoidingView>
            </>
          ) : (
            <ActivityIndicator size="large" color={Colors.primaryColor} />
          )}
        </SafeAreaView>
      </>
    );
  }
}

FatherFormScreen.navigationOptions = (navigationData) => {
  console.log('navigationData', navigationData);
  const showMenu = navigationData.navigation.isFirstRouteInParent();

  if (showMenu) {
    return {
      headerTitle: '',
      headerRight: (
        <HeaderButtons HeaderButtonComponent={HeaderButton}>
          <Item
            title="Menu"
            iconName="md-menu"
            onPress={() => {
              navigationData.navigation.toggleDrawer();
            }}
          />
        </HeaderButtons>
      ),
    };
  } else {
    return {
      headerTitle: '',
      headerRight: (
        <HeaderButtons HeaderButtonComponent={HeaderButton}>
          <Item
            title="Menu"
            iconName="md-menu"
            onPress={() => {
              navigationData.navigation.toggleDrawer();
            }}
          />
        </HeaderButtons>
      ),
      headerBackTitle: i18n.t('GENERAL.BACK'),
    };
  }
};

export default FatherFormScreen;
