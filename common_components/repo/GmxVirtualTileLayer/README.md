== TMS ==
����������� ���� ���������� ��� ����������� ����������� �������� ��������� ���� (`L.TileLayer`).
��� ������������ ����: `TMS` (��� �������� ������������� �������������� `TiledRaster`)

����-���������:
  * `url-template` - ������ URL ������, ��� � Leaflet
  * `merc-projection` - ���� ���� ����� �������� (� ����� ���������), �������, ��� ����� � �������� EPSG 3395. � ���� ������ ������������ ������ `L.TileLayer.Mercator`
  * `minZoom`, `maxZoom` - ����������� �� �����

����� ������ ���������� ���� ����� ������� `Leaflet-GeoMixer`.

== WMS ==
����������� ���� ���������� ��� ����������� WMS ���� (`L.TileLayer.WMS`).
��� ������������ ����: `WMS`

����-���������:
  * `base-url` - ����� WMS �������
  * `layers`, `styles`, `format`, `transparent`, `version`, `minZoom`, `maxZoom` - ��������� `L.TileLayer.WMS`
  * `clickable` - (����� ��������). ���� �������� ������, ���� ����� ����������� ����� �� ���� � �������� ������� �� ������
  * `balloonTemplate` - ������ ������� (������������ Leaflet'�). ����� ����� ������ ��� clickable-����