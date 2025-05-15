import * as Location from "expo-location";

const useLocation = async () => {
    const [errorMsg,setErrorMsg]=useState("");
    const [longitude,setLongitutde]=useState("");
    const [latitude,setLatitude]=useState("");

    let {status} =await Location.requestForegroundPermissionsAsync();

        if(status !=="granted"){
            setErrorMsg("Permission to Location was not granted");
            return;
        }
        let {coords}=await Location.getCurrentPositionAsync();

        if(coords){
            const {latitude, longitutde} = coords;
            console,log("lat and long is",latitude, longitutde);
            setLatitude(latitude);
            setLongitutde(longitutde);
            let response =await Location.reverseGeocodeAsync({
                latitude,
                longitude
            })

            console.log('USER LOCATION IS',response);
        }

    return {latitude, longitude,errorMsg};
};

export default useLocation;