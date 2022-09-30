export const BaseUrl = 'https://sapient-prod.azurewebsites.net';
// export const BaseUrl = 'https://sapient-prod-qa.azurewebsites.net';
// export const BaseUrl = 'https://sapient-prod-dev.azurewebsites.net';
// export const BaseUrl = 'https://sapient-prod-stage.azurewebsites.net';
// export const BaseUrl = 'https://sapient-prod-beta.azurewebsites.net/';

// new things

export const portfolioOverall = '/api/energy/portfolio/overall';
export const portfolioBuilidings = '/api/energy/portfolio/buildings';
export const portfolioEndUser = '/api/energy/portfolio/end-user';

export const builidingOverview = '/api/energy/building/overview';
export const builidingAlerts = '/api/energy/building/alerts';
export const builidingPeak = '/api/energy/building/peak';
export const builidingHourly = '/api/energy/time_of_day/hourly';
export const builidingEquipments = '/api/energy/building/equipment';

// utility bills
export const generalUtilityBills = '/api/config/utility_bills';
export const updateUtilityBill = '/api/config/utility_bills';

// general settings
export const generalBuildingDetail = '/api/config/general/building_details';
export const singleBuildingDetail = '/api/config/general/building-details';
export const generalBuildingAddress = '/api/config/general/address';
export const generalDateTime = '/api/config/general/date_time';
export const generalOperatingHours = '/api/config/general/operating_hours';
export const generalBldgDelete = '/api/config/general/delete_building';
export const updateAccount = '/api/user_role/user/update-user';
export const listUsers = '/api/user_role/user/list_user_by_parentId';
export const addUser = '/api/user_role/user/add_user';

// end-uses
export const endUses = '/api/energy/portfolio/end-user';
export const endUsesChart = '/api/energy/end_use/chart/end-uses';
export const hvacUsageChart = '/api/energy/chart/hvac';
export const endUsesUsageChart = '/api/energy/end_use/load_usage';
export const endUsesEquipmentUsage = '/api/energy/end_use/equipment_type_usage';
export const equipmentDetails = '/api/config/equipments_details/by_id';

// equipments
export const generalEquipments = '/api/config/equipments_details/';
export const equipmentType = '/api/config/get_equipment_type/';
export const getEquipmentType = '/api/config/get_equipment_type_by_name/';
export const addEquipmentType = '/api/config/create_equipment_type';
export const updateEquipmentType = '/api/config/update_equipment_type';
export const createEquipment = '/api/config/equipments_details/create_equipment';
export const updateEquipment = '/api/config/equipments_details/update_equipment';
export const searchEquipment = '/api/config/equipments_details/search_by_equipments';
export const getEndUseId = '/api/config/get_end_use';
export const linkActiveSensorToEquip = '/api/config/sensor/active/lnk_act_snr_to_eqt';
export const deleteEquipment = `/api/config/equipments_details/delete-equipment`;

// active
export const generalActiveDevices = '/api/config/devices/active';
export const updateActivePassiveDevice = '/api/config/devices/update_device';

//search active and passive device
export const searchDevices = '/api/config/devices/search_by_devices';
export const lastUsedEquimentDevice = '/api/config/equipments_details/equipments_last_used';

// passive
export const generalPassiveDevices = '/api/config/devices/passive';
export const sensorGraphData = '/api/config/sensor/graph';
export const equipmentGraphData = '/api/explorer/equipment_chart';
export const updateDevice = '/api/config/devices/update_device';
export const deletePassiveDevice = `/api/config/devices/delete/passive`;

//gateway
export const generalGateway = '/api/config/gateway';

// panel
export const generalPanels = '/api/config/panels/';
export const createPanel = '/api/config/panels/create_panel';
export const updatePanel = '/api/config/panels/update_panel';
export const createBreaker = '/api/config/panels/create_breaker';
export const updateBreakers = '/api/config/panels/v2/update_breaker';
export const getBreakers = '/api/config/panels/breakers';
export const updateLinkBreakers = '/api/config/panels/link_breakers';
export const resetBreakers = '/api/config/panels/reset/breakers';
export const deletePanel = '/api/config/panels/delete';
export const deleteBreaker = '/api/config/panels/delete/breaker';

// getBuilding
export const getBuilding = '/api/config/get_buildings';
export const energyUsage = '/api/energy/energy/usage';

// compare-buildings
export const compareBuildings = '/api/energy/energy/compare_building';
export const sortCompareBuildings = '/api/energy/energy/sort-compare-buildings';
export const searchCompareBuildings = '/api/energy/energy/search-compare-buildings';

//config settings
export const getBuildings = '/api/config/get_buildings';
export const createBuilding = '/api/config/create_building';
export const generalBuilding = '/api/config/general/general-buildings';
export const createDevice = '/api/config/devices/create_device';
export const kasaLinkAccount = '/api/config/kasa/link_account';
export const kasaUnLinkAccount = '/api/config/kasa/unlink_account';
export const get_kasa_account = '/api/config/kasa/get_kasa_account';

export const get_kasa_devices = '/api/config/kasa/get_devices';
export const insert_kasa_devices = '/api/config/kasa/insert_device';
export const addToSystem = '/api/config/kasa/add_to_system';

// layout
export const getLayouts = '/api/config/get_layout/';
export const getFloors = '/api/config/layout/get-floors';
export const createFloors = '/api/config/layout/create-floor';
export const getSpaces = '/api/config/layout/get-spaces';
export const getSpaceTypes = '/api/config/layout/get-spacetype';
export const createSpace = '/api/config/layout/create-space';
export const updateSpace = '/api/config/layout/update-floor';
export const deleteSpace = '/api/config/layout/delete-space';
export const deleteFloor = '/api/config/layout/delete-floor';

// getLocation
export const getLocation = '/api/config/get_location';

// charts
export const getEnergyConsumption = '/api/energy/chart';

// explore
export const getExplore = '/api/explorer/chart';
export const getExploreByBuilding = '/api/explorer/chart/by_building';
export const getExploreBuildingList = '/api/explorer/building_list';
export const getExploreBuildingChart = '/api/explorer/building_chart';
export const getExploreEquipmentList = '/api/explorer/equipment_list';
export const getExploreEquipmentChart = '/api/explorer/equipment_chart';
export const getExploreByEquipment = '/api/explorer/chart/by_equipment';
export const getExploreEquipmentYTDUsage = '/api/explorer/equipment_ytd_usage';
export const getEquipmentChart = '/api/explorer/equipment_chart';

// Peak Demand
export const peakDemand = '/api/energy/peak_demand';
export const peakDemandTrendChart = '/api/energy/peak_demand/chart/peak';
export const peakDemandYearlyPeak = '/api/energy/peak_demand/yearly_peaks';
export const peakEquipType = '/api/energy/peak_demand/equipment_type';
export const peakEquipUsage = '/api/energy/peak_demand/equipment';
export const avgDailyUsageByHour = '/api/energy/time_of_day/chart';

// sensors list
export const listSensor = '/api/config/sensor/list_sensor';

// plug rules
export const listPlugRules = '/api/user_role/plug_rule/all-plug-rules';
export const createPlugRule = '/api/user_role/plug_rule/create-plug-rule';
export const updatePlugRule = '/api/user_role/plug_rule/update';

// Auth
export const signin = '/api/user_role/user/signin';
export const signup = '/api/user_role/user/signup';

export const linkSocketRules = '/api/user_role/plug_rule/list_link_socket';
export const unLinkSocketRules = '/api/user_role/plug_rule/list_sensor_by_buildingID';
export const linkSocket = '/api/user_role/plug_rule/link_socket';
export const unLinkSocket = '/api/user_role/plug_rule/unlink_socket';
export const graphData = '/api/user_role/plug_rule/average-chart-calculation';

// user permission and roles
export const addMemberUser = '/api/user_role/user-permission-role/add-member-user';
export const getMemberUser = '/api/user_role/user-permission-role/all-member-users';
export const createPermissionRole = '/api/user_role/user-permission-role/create-permission-role';
export const getPermissionRole = '/api/user_role/user-permission-role/permission-roles-list';
export const getPermissionSingleDetail = '/api/user_role/user-permission-role/permission-details';
export const updatePermissionDetail = '/api/user_role/user-permission-role/update-permission-role';
export const getSingleUserDetail = '/api/user_role/user-permission-role/member-user-info';
export const updateSingleUserDetail = '/api/user_role/user-permission-role/update-member-user';
export const assignUser = '/api/user_role/user-permission-role/assign-user-role';
export const singleUserPermissionDetail = '/api/user_role/user-permission-role/user-permissions-restrctions';

// Search
export const serachUser = '/api/user_role/user-permission-role/all-member-users';
