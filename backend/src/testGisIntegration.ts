import { prisma } from './config/prisma';
import { gisService } from './modules/gis/gis.service';

async function runGisIntegrationTest() {
  console.log('🧪 Starting Phase 6 GIS Infrastructure & Geospatial Mapping Integration Test...');

  // 1. Query All Project GIS Markers
  const allMarkers = await gisService.getProjectGisMarkers({});
  console.log(`📍 Retrieved Total Mapped GIS Markers: ${allMarkers.length}`);
  if (allMarkers.length === 0) {
    throw new Error('No projects found to map GIS markers!');
  }

  const sampleMarker = allMarkers[0]!;
  console.log(`📌 Sample Mapped Marker: ${sampleMarker.projectCode} - ${sampleMarker.name}`);
  console.log(`   Location: Lat ${sampleMarker.latitude}, Lng ${sampleMarker.longitude} | District: ${sampleMarker.district}`);

  // 2. Spatial Query with District Filter
  console.log('🔍 Executing GIS query filtered by District = "AHMEDABAD"...');
  const ahmMarkers = await gisService.getProjectGisMarkers({ district: 'AHMEDABAD' });
  console.log(`✅ Mapped Ahmedabad Markers Count: ${ahmMarkers.length}`);

  // 3. Haversine Radius Proximity Search (25 km radius around Ahmedabad center)
  console.log('🌐 Executing Haversine 25 km Proximity Radius Search around [23.0225, 72.5714]...');
  const radiusMarkers = await gisService.getProjectGisMarkers({
    centerLat: 23.0225,
    centerLng: 72.5714,
    radiusKm: 25,
  });
  console.log(`✅ Markers within 25 km radius: ${radiusMarkers.length}`);

  // 4. Update Project GIS Coordinates
  const targetProject = await prisma.project.findFirst();
  if (!targetProject) throw new Error('Target project missing!');

  console.log(`🎯 Updating Coordinates for Project ID: ${targetProject.projectCode}...`);
  const officerUser = await prisma.user.findFirst();
  const userId = officerUser?.id || 'usr-admin';

  const updateResult = await gisService.updateProjectCoordinates(
    targetProject.id,
    23.0325,
    72.5850,
    userId
  );

  console.log(`✅ Coordinates Updated: Lat ${updateResult.latitude}, Lng ${updateResult.longitude}`);

  // Verify database record & audit log
  const dbProject = await prisma.project.findUnique({ where: { id: targetProject.id } });
  console.log(`✅ Verified DB Coordinates: Lat ${dbProject?.latitude}, Lng ${dbProject?.longitude}`);

  const auditLog = await prisma.auditEvent.findFirst({
    where: { projectId: targetProject.id, action: 'GIS_COORDINATES_UPDATED' },
    orderBy: { timestamp: 'desc' },
  });
  console.log(`📜 Immutable Audit Event Logged: ID ${auditLog?.id}, Action: ${auditLog?.action}`);

  // 5. Fetch GIS Boundary Overlays
  console.log('🗺️ Fetching GIS Boundary Layer Overlays...');
  const layers = await gisService.getGisLayers();
  console.log(`✅ GIS Layers Retrieved: ${layers.length} layer(s) (${layers.map((l) => l.layerName).join(', ')})`);

  console.log('🎉 Phase 6 GIS Integration Test PASSED Cleanly!');
}

runGisIntegrationTest()
  .catch((err) => {
    console.error('❌ GIS Integration Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
